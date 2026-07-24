from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import leads_col, users_col, get_next_sequence_value
from schemas import CustomerCreate, AnalyticsResponse
from crud import create_lead, get_leads
from analytics import get_analytics
from predict import _load_artefacts
from sample_data import SAMPLE_CUSTOMERS

from auth import get_current_user

from routers.auth_router import router as auth_router
from routers.customers_router import router as customers_router
from routers.chat_router import router as chat_router
from routers.admin_router import router as admin_router

app = FastAPI(
    title="AI Lending Lead Intelligence API",
    description="AI-powered lead scoring and loan recommendation backend.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(chat_router)
app.include_router(admin_router)


# ── Startup ───────────────────────────────────────────────────────────────────

DEFAULT_USERS = [
    {"employee_id": "RM001",  "password": "password123", "name": "Karthikeyan Murugan",  "role": "rm",    "branch": "Chennai South",      "email": "karthikeyan.m@example.com",   "phone": "+91 98765 43210", "avatar": "KM", "joined": "Jan 2022", "performance": 92},
    {"employee_id": "BM001",  "password": "password123", "name": "Meenakshi Sundaram",   "role": "bm",    "branch": "Coimbatore Central", "email": "meenakshi.s@example.com",    "phone": "+91 98765 43211", "avatar": "MS", "joined": "Mar 2019", "performance": 88},
    {"employee_id": "ADM001", "password": "admin123",    "name": "Thiruvenkatam Pillai", "role": "admin", "branch": "HQ Chennai",         "email": "thiruvenkatam.p@example.com", "phone": "+91 98765 43212", "avatar": "TP", "joined": "Jun 2015", "performance": 96},
]


@app.on_event("startup")
async def startup_event():
    _load_artefacts()
    await _seed_users()
    await _seed_customers()


async def _seed_users():
    for u in DEFAULT_USERS:
        if not await users_col.find_one({"employee_id": u["employee_id"]}):
            uid = await get_next_sequence_value("user_id")
            await users_col.insert_one({**u, "id": uid})


async def _seed_customers():
    if await leads_col.count_documents({}) > 0:
        return
    for customer in SAMPLE_CUSTOMERS:
        await create_lead(CustomerCreate(**customer))


@app.get("/health")
def health():
    return {"status": "OK"}


@app.get("/analytics", response_model=AnalyticsResponse)
async def analytics(caller: dict = Depends(get_current_user)):
    return await get_analytics()
