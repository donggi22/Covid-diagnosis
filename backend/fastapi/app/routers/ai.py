from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from bson import ObjectId
from pathlib import Path
import tempfile
import os
import json

import app.db.mongo as mongo
from app.models.ai import DiagnosisResponse, Finding
from app.services import model as model_service

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
        # 임시 파일 생성
        suffix = os.path.splitext(image.filename)[1] if image.filename else '.png'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await image.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
        
        image_path = Path(temp_path)

        
        if not image_path.exists():
                raise HTTPException(status_code=400, detail=f'이미지 파일을 저장할 수 없습니다: {image_path}')
            
        print(f'📥 업로드된 이미지 파일 저장 완료: {image_path}')

        # 실제 AI 모델을 사용한 예측 (시간 측정)
        import time
        import traceback
        start_time = time.time()
        try:
            print(f'🚀 진단 요청 시작 - 이미지: {image_path}')
            inference_result = model_service.predict(image_path)
            elapsed_time = time.time() - start_time
            print(f'⏱️ AI 모델 예측 완료: {elapsed_time:.2f}초 소요')
            
            # 예측 시간 확인 (CPU 사용 시 더 짧을 수 있음)
            if elapsed_time < 0.5:
                print(f'⚠️ 경고: 예측 시간이 너무 짧습니다 ({elapsed_time:.2f}초). 모델이 제대로 실행되지 않았을 수 있습니다.')
            elif elapsed_time < 2:
                print(f'ℹ️ 정보: 예측 시간이 {elapsed_time:.2f}초입니다. (CPU 사용 시 정상 범위)')
            else:
                print(f'✅ 예측 시간: {elapsed_time:.2f}초 (정상)')
            
        except Exception as e:
            elapsed_time = time.time() - start_time
            print(f'❌ AI 모델 예측 실패 ({elapsed_time:.2f}초): {str(e)}')
            print(f'❌ 상세 에러:\n{traceback.format_exc()}')
            raise HTTPException(status_code=500, detail=f'AI 모델 예측 중 오류가 발생했습니다: {str(e)}')
        
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

    import time
    response_build_start = time.time()
    response = DiagnosisResponse(
            patient_id=patient_id or '',
        confidence=inference_result['confidence'],
        findings=findings,
        recommendations=inference_result['recommendations'],
        ai_notes=inference_result['ai_notes'],
        gradcam_path=inference_result.get('gradcam_path'),
        gradcam_plus_path=inference_result.get('gradcam_plus_path'),
        layercam_path=inference_result.get('layercam_path'),
    )
    response_build_time = time.time() - response_build_start
    print(f'📦 응답 객체 생성 완료: {response_build_time:.4f}초')

    # 일반 dict 반환 (FastAPI가 자동으로 JSONResponse로 변환)
    serialization_start = time.time()
    response_dict = {
        'patient_id': response.patient_id,
        'confidence': response.confidence,
        'findings': [
            {
                'condition': f.condition,
                'probability': f.probability,
                'description': f.description
            } for f in response.findings
        ],
        'recommendations': response.recommendations,
        'ai_notes': response.ai_notes,
        'gradcam_path': response.gradcam_path,
        'gradcam_plus_path': response.gradcam_plus_path,
        'layercam_path': response.layercam_path
    }
    serialization_time = time.time() - serialization_start
    print(f'✅ 응답 dict 생성 완료: {serialization_time:.4f}초')
    print(f'🚀 FastAPI 응답 반환 (dict)...')

    # MongoDB Depends가 cleanup되기 전에 return
    return response_dict
