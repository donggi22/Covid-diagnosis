from pathlib import Path
from functools import lru_cache
import os

from dotenv import load_dotenv
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

# .env 파일 로드 (강력한 경로 탐색)
env_loaded = False
for path in [BASE_DIR / '.env', BASE_DIR.parent / '.env', Path('.env')]:
    if path.exists():
        load_dotenv(path, override=True)
        print(f"✅ 환경 변수 로드 성공: {path.absolute()}")
        env_loaded = True
        break

if not env_loaded:
    print("⚠️  경고: .env 파일을 찾을 수 없어 기본 설정을 사용합니다.")


class Settings(BaseModel):
    app_name: str = 'FastAPI AI Service'
    # .env에서 값을 읽어오되, 따옴표 제거 처리
    mongo_uri: str = str(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/medical-ai')).strip('"\'')
    mongo_db: str = str(os.getenv('MONGODB_DB', 'x-ray')).strip('"\'')
    model_path: Path = Path(
        os.getenv('MODEL_PATH', str(BASE_DIR.parent.parent.parent / 'best_model.pth'))
    )
    
    # Cloudinary Config (따옴표 제거 포함)
    cloudinary_cloud_name: str = str(os.getenv('CLOUDINARY_CLOUD_NAME', '')).strip('"\'')
    cloudinary_api_key: str = str(os.getenv('CLOUDINARY_API_KEY', '')).strip('"\'')
    cloudinary_api_secret: str = str(os.getenv('CLOUDINARY_API_SECRET', '')).strip('"\'')


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # 디버깅을 위해 로드된 URI 출력 (비밀번호 마스킹)
    if 'mongodb+srv' in settings.mongo_uri or '@' in settings.mongo_uri:
        # URI에서 @ 이후 부분만 추출하여 마스킹
        try:
            parts = settings.mongo_uri.split('@')
            host_info = parts[-1].split('?')[0]
            print(f"📡 MongoDB Atlas 연결 시도 중: ...@{host_info}")
        except:
            print("📡 MongoDB Atlas 연결 시도 중 (URI 형식 확인 필요)")
    else:
        print(f"📡 MongoDB 로컬 연결 시도 중: {settings.mongo_uri}")
    return settings