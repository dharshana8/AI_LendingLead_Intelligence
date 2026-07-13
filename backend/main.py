from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import csv
import io

import models
from database import engine, get_db
from schemas import CustomerCreate, CustomerUpdate, CustomerResponse, AnalyticsResponse
from crud import create_lead, get_leads, get_lead, delete_lead, update_lead
from analytics import get_analytics
from predict import _load_artefacts
from sample_data import SAMPLE_CUSTOMERS

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Lending Lead Intelligence API",
    description="IDBI Bank Hackathon — AI-powered lead scoring and loan recommendation backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    _load_artefacts()


@app.get("/health")
def health():
    return {"status": "OK"}


# ── Auth ──────────────────────────────────────────────────────────────────────
USERS_DB = [
    {"id": 1, "employeeId": "RM001", "password": "password123", "name": "Ankit Sharma", "role": "rm", "branch": "Mumbai Main", "email": "ankit.sharma@idbi.co.in", "phone": "+91 98765 43210", "avatar": "AS", "joined": "Jan 2022", "performance": 92},
    {"id": 2, "employeeId": "BM001", "password": "password123", "name": "Priya Mehta", "role": "bm", "branch": "Delhi Central", "email": "priya.mehta@idbi.co.in", "phone": "+91 98765 43211", "avatar": "PM", "joined": "Mar 2019", "performance": 88},
    {"id": 3, "employeeId": "ADM001", "password": "admin123", "name": "Rajiv Nair", "role": "admin", "branch": "HQ Mumbai", "email": "rajiv.nair@idbi.co.in", "phone": "+91 98765 43212", "avatar": "RN", "joined": "Jun 2015", "performance": 96},
]


class LoginRequest(BaseModel):
    employeeId: str
    password: str


class RegisterRequest(BaseModel):
    employeeId: str
    password: str
    name: str
    role: str = "rm"
    branch: str = "Mumbai Main"
    email: str = ""
    phone: str = ""


@app.post("/login")
def login(payload: LoginRequest):
    user = next((u for u in USERS_DB if u["employeeId"] == payload.employeeId and u["password"] == payload.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Employee ID or Password")
    return {k: v for k, v in user.items() if k != "password"}


@app.post("/register", status_code=201)
def register(payload: RegisterRequest):
    if any(u["employeeId"] == payload.employeeId for u in USERS_DB):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    new_user = {
        "id": len(USERS_DB) + 1,
        "employeeId": payload.employeeId,
        "password": payload.password,
        "name": payload.name,
        "role": payload.role,
        "branch": payload.branch,
        "email": payload.email,
        "phone": payload.phone,
        "avatar": "".join(w[0] for w in payload.name.split()[:2]).upper(),
        "joined": "2025",
        "performance": 75,
    }
    USERS_DB.append(new_user)
    return {k: v for k, v in new_user.items() if k != "password"}


# ── Customers ─────────────────────────────────────────────────────────────────
@app.post("/customers", response_model=CustomerResponse, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return create_lead(db, payload)


@app.get("/customers", response_model=list[CustomerResponse])
def list_customers(
    priority: str | None = Query(default=None, pattern="^(High|Medium|Low)$"),
    db: Session = Depends(get_db),
):
    return get_leads(db, priority)


@app.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    lead = get_lead(db, customer_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return lead


@app.delete("/customers/{customer_id}", status_code=204)
def remove_customer(customer_id: int, db: Session = Depends(get_db)):
    if not delete_lead(db, customer_id):
        raise HTTPException(status_code=404, detail="Customer not found.")


@app.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    lead = update_lead(db, customer_id, payload)
    if not lead:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return lead


@app.post("/load-sample", response_model=list[CustomerResponse], status_code=201)
def load_sample(db: Session = Depends(get_db)):
    results = []
    for customer in SAMPLE_CUSTOMERS:
        payload = CustomerCreate(**customer)
        results.append(create_lead(db, payload))
    return results


@app.get("/export")
def export_csv(db: Session = Depends(get_db)):
    leads = get_leads(db)
    output = io.StringIO()
    fields = ["customer_id", "name", "age", "occupation", "cibil_score", "income",
              "ai_score", "conversion_probability", "priority", "recommended_loan",
              "top_signal", "status", "assigned_to", "last_contact", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for lead in leads:
        row = {f: getattr(lead, f, "") for f in fields}
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=idbi_leads_export.csv"},
    )


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)):
    return get_analytics(db)
