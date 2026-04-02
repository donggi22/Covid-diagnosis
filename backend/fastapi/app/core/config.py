from pathlib import Path
from functools import lru_cache
import os

from dotenv import load_dotenv
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=True)


class Settings(BaseModel):
    app_name: str = 'FastAPI AI Service'
    mongo_uri: str = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/medical-ai')
    mongo_db: str = os.getenv('MONGODB_DB', 'medical-ai')
    model_path: Path = Path(
        os.getenv('MODEL_PATH', BASE_DIR.parent.parent.parent / 'best_model.pth')
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
