from collections.abc import AsyncGenerator
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.routers import ai
from app.services.model import load_model, unload_model


async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await connect_to_mongo()

    # 서버 시작 시 모델 로딩 (동기)
    print("🔄 AI 모델 로딩 시작...")
    load_model()
    print("✅ AI 모델 로딩 완료!")

    try:
        yield
    finally:
        unload_model()
        await close_mongo_connection()


app = FastAPI(title='Medical AI FastAPI', lifespan=lifespan)
app.include_router(ai.router)

# Static files for Grad-CAM images (로컬 폴더가 존재하는 경우에만 마운트)
static_dir = Path(__file__).parent / 'static'
if static_dir.exists():
    app.mount('/static', StaticFiles(directory=str(static_dir)), name='static')


@app.get('/')
async def root():
    return {'message': 'FastAPI AI 서비스가 실행 중입니다.'}
