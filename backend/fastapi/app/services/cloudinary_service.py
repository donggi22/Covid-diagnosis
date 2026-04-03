import cloudinary
import cloudinary.uploader
import asyncio
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import io
import os
from typing import List, Dict, Any, Optional
from app.core.config import get_settings

# Global initialization flag
_initialized = False

def init_cloudinary():
    """Cloudinary 설정을 초기화한다."""
    global _initialized
    if not _initialized:
        settings = get_settings()
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True
        )
        _initialized = True
        # print(f"☁️  Cloudinary 초기화 완료: {settings.cloudinary_cloud_name}")

def upload_image(image_obj: Any, filename: str, folder: str = "uploads") -> Optional[str]:
    """
    단일 이미지를 Cloudinary에 업로드한다.
    image_obj: PIL Image 객체 또는 파일 경로
    """
    init_cloudinary()
    try:
        # PIL Image인 경우 바이트로 변환
        if isinstance(image_obj, Image.Image):
            buf = io.BytesIO()
            # 원본 형식을 유지하되, JPEG로 변환하여 업로드 속도 및 용량 최적화
            image_obj.save(buf, format='JPEG', quality=85)
            buf.seek(0)
            file_to_upload = buf
        else:
            file_to_upload = image_obj

        # 업로드 수행
        result = cloudinary.uploader.upload(
            file_to_upload,
            public_id=filename,
            folder=folder,
            overwrite=True,
            resource_type="image"
        )
        
        secure_url = result.get("secure_url")
        # print(f"     [Cloudinary] 업로드 성공: {secure_url}")
        return secure_url
        
    except Exception as e:
        print(f"❌ [Cloudinary] 단일 이미지 업로드 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def upload_images_parallel(cam_tasks: List[Dict[str, Any]]) -> List[Optional[str]]:
    """
    여러 이미지를 병렬로 Cloudinary에 업로드한다.
    cam_tasks: {'image': PIL.Image, 'filename': str, 'type': str} 형태의 리스트
    """
    init_cloudinary()
    
    # 결과 리스트 초기화
    results = [None] * len(cam_tasks)
    
    def _upload_task(idx: int, task: Dict[str, Any]):
        try:
            # CAM 이미지는 'gradcam' 폴더에 저장
            url = upload_image(task['image'], task['filename'], folder="gradcam")
            results[idx] = url
        except Exception as e:
            print(f"❌ [Cloudinary] 병렬 업로드 중 오류 (index {idx}): {str(e)}")

    # ThreadPoolExecutor를 사용하여 병렬 업로드 (I/O Bound 작업에 적합)
    max_workers = min(len(cam_tasks), 5)  # 최대 5개 스레드
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for i, task in enumerate(cam_tasks):
            executor.submit(_upload_task, i, task)
            
    return results

def delete_image(image_url: str) -> bool:
    """
    Cloudinary URL에서 public_id를 추출하여 이미지를 삭제한다.
    """
    if not image_url or "cloudinary.com" not in image_url:
        return False
        
    try:
        init_cloudinary()
        
        # URL 형식: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
        parts = image_url.split('/')
        upload_index = -1
        for i, part in enumerate(parts):
            if part == 'upload':
                upload_index = i
                break
        
        if upload_index == -1:
            return False
            
        # 버전 부분 찾기 (v로 시작하고 숫자가 포함된 부분)
        version_index = -1
        for i in range(upload_index + 1, len(parts)):
            if parts[i].startswith('v') and any(char.isdigit() for char in parts[i]):
                version_index = i
                break
        
        # public_id는 버전 이후(있을 경우) 또는 upload 이후부터 시작
        start_index = version_index + 1 if version_index != -1 else upload_index + 2
        
        relevant_parts = parts[start_index:]
        full_path = "/".join(relevant_parts)
        # 확장자 제거
        public_id = full_path.rsplit('.', 1)[0]
        
        # print(f"     [Cloudinary] 삭제 시도 중: {public_id}")
        result = cloudinary.uploader.destroy(public_id)
        
        if result.get("result") == "ok":
            # print(f"     [Cloudinary] 삭제 성공: {public_id}")
            return True
        else:
            print(f"     [Cloudinary] 삭제 실패 또는 이미 존재하지 않음: {result}")
            return False
            
    except Exception as e:
        print(f"❌ [Cloudinary] 이미지 삭제 중 예외 발생: {str(e)}")
        return False
