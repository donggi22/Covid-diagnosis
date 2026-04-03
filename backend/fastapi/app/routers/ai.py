from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pathlib import Path
import tempfile
import os
import json
import uuid

import app.db.mongo as mongo
from app.models.ai import DiagnosisResponse, Finding
from app.services import model as model_service
import asyncio
import time
import traceback
from PIL import Image
import app.services.cloudinary_service as cloudinary_service

router = APIRouter(prefix='/api/ai', tags=['AI'])


def get_mongo_session():
    if mongo.session is None:
        raise HTTPException(status_code=503, detail='MongoDB 연결이 준비되지 않았습니다.')
    return mongo.session


@router.get('/health')
async def health_check(mongo_session=Depends(get_mongo_session)):
    return {'status': 'ok'}


@router.post('/diagnose')
async def diagnose(
    image: UploadFile = File(...),
    patient_id: str = Form(default=''),
    notes: str = Form(default=None)
):
    # MongoDB 쿼리 제거 - 속도 최적화 (환자 정보는 Express에서 관리)
    patient = None

    # 업로드된 파일을 임시로 저장
    temp_path = None
    try:
        # 1. 임시 파일 생성 및 저장
        suffix = os.path.splitext(image.filename)[1] if image.filename else '.png'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await image.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
        
        image_path = Path(temp_path)
        if not image_path.exists():
            raise HTTPException(status_code=400, detail='이미지 파일을 저장할 수 없습니다.')
        
        print(f'📥 업로드된 이미지 파일 저장 완료: {image_path}')

        # 병렬 처리 시작: 원본 파일 업로드와 AI 추론을 동시에 진행
        start_time = time.time()
        print(f'🚀 [병렬 처리 시작] 원본 업로드 & AI 추론 동시 진행...')

        # 1. 원본 이미지 업로드 태스크 (백그라운드 스레드)
        async def upload_original():
            try:
                upload_task_start = time.time()
                with Image.open(temp_path) as img:
                    # JPEG로 변환하여 업로드 속도 향상 (cloudinary_service 내부에서 처리)
                    # 고유 파일명 생성: patient_id + uuid로 덮어쓰기 방지
                    base_name = os.path.splitext(image.filename or 'upload')[0]
                    unique_filename = f"original_{patient_id}_{uuid.uuid4().hex[:12]}_{base_name}"
                    url = await asyncio.to_thread(
                        cloudinary_service.upload_image, 
                        img, unique_filename, "uploads"
                    )
                    duration = time.time() - upload_task_start
                    print(f"     ✅ [Router] 원본 이미지 업로드 성공 ({duration:.2f}초)")
                    return url
            except Exception as e:
                print(f'⚠️ 원본 이미지 Cloudinary 업로드 실패: {e}')
                return None

        upload_task = asyncio.create_task(upload_original())

        # 2. AI 모델 예측 (백그라운드 스레드)
        try:
            inference_task_start = time.time()
            inference_result = await asyncio.to_thread(model_service.predict, image_path)
            duration = time.time() - inference_task_start
            print(f"     ✅ [Router] AI 모델 추론 및 CAM 업로드 완료 ({duration:.2f}초)")
        except Exception as e:
            print(f'❌ AI 모델 예측 실패: {str(e)}')
            print(f'❌ 상세 에러:\n{traceback.format_exc()}')
            raise HTTPException(status_code=500, detail=f'AI 모델 예측 중 오류가 발생했습니다: {str(e)}')

        # 업로드 결과 대기
        wait_start = time.time()
        original_image_url = await upload_task
        wait_duration = time.time() - wait_start
        if wait_duration > 0.1:
            print(f"     ℹ️ [Router] 원본 업로드 대기 추가 소요 시간: {wait_duration:.2f}초")
        
        elapsed_time = time.time() - start_time
        print(f'⏱️ 전체 병렬 처리 완료: {elapsed_time:.2f}초 소요')
        
    finally:
        # 임시 파일 삭제
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                print(f'🗑️ 임시 파일 삭제 완료: {temp_path}')
            except Exception as e:
                print(f'⚠️ 임시 파일 삭제 실패: {e}')

    findings = [
        Finding(
            condition=item['condition'],
            probability=item['probability'],
            description=item['description'],
        )
        for item in inference_result['findings']
    ]

    from datetime import datetime

    # 응답 dict 생성 (DB 저장은 Express에서 수행하도록 위임)
    response_dict = {
        'patient_id': patient_id,
        'confidence': inference_result['confidence'],
        'predicted_class': inference_result['predicted_class'],
        'findings': [
            {
                'condition': f.condition,
                'probability': f.probability,
                'description': f.description
            } for f in findings
        ],
        'recommendations': inference_result['recommendations'],
        'ai_notes': inference_result['ai_notes'],
        'gradcam_path': inference_result.get('gradcam_path'),
        'gradcam_plus_path': inference_result.get('gradcam_plus_path'),
        'layercam_path': inference_result.get('layercam_path'),
        'image_url': original_image_url
    }

    return response_dict


@router.delete('/image')
async def delete_image(image_url: str):
    """
    이미지 URL을 받아 Cloudinary에서 이미지를 삭제한다.
    """
    if not image_url:
        raise HTTPException(status_code=400, detail="이미지 URL이 필요합니다.")
        
    try:
        # 동기 함수를 별도 스레드에서 실행 (병렬 업로드와 동일한 서비스 사용)
        success = await asyncio.to_thread(cloudinary_service.delete_image, image_url)
        
        if success:
            return {"status": "success", "message": "이미지가 성공적으로 삭제되었습니다."}
        else:
            return {"status": "error", "message": "이미지 삭제에 실패했거나 지원되지 않는 URL입니다."}
            
    except Exception as e:
        print(f"❌ 이미지 삭제 도중 에러 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"이미지 삭제 중 내부 서버 오류: {str(e)}")
