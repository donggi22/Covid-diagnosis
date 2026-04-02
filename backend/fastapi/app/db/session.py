from motor.motor_asyncio import AsyncIOMotorDatabase


class MongoSession:
    def __init__(self, database: AsyncIOMotorDatabase):
        self._database = database

    @property
    def db(self) -> AsyncIOMotorDatabase:
        return self._database

    @property
    def patients(self):
        return self._database.get_collection('patients')

    @property
    def diagnoses(self):
        return self._database.get_collection('diagnoses')

    @property
    def users(self):
        return self._database.get_collection('users')
