from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "idbi_lending")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

leads_col = db["leads"]
users_col = db["users"]
audit_col = db["audit_logs"]

async def get_next_sequence_value(sequence_name: str) -> int:
    result = await db["counters"].find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return result["sequence_value"]
