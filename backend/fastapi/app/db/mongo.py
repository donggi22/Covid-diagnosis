from motor.motor_asyncio import AsyncIOMotorClient

from .session import MongoSession
from app.core.config import get_settings

client: AsyncIOMotorClient | None = None
session: MongoSession | None = None


async def connect_to_mongo() -> None:
    global client, session
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)
    session = MongoSession(client[settings.mongo_db])
    print('✅ FastAPI MongoDB 연결 성공')


async def close_mongo_connection() -> None:
    global client
    if client:
        client.close()
        print('🛑 FastAPI MongoDB 연결 종료')
