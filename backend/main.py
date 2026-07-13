from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
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
    _load_artefacts()  # pre-load model, scaler, shap explainer into cache


@app.get("/health")
def health():
    return {"status": "OK"}


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
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Age", "Occupation", "CIBIL Score", "Income",
                     "AI Score", "Conversion Probability", "Priority", "Recommended Loan",
                     "Top Signal", "Explanation", "Created At"])
    for l in leads:
        writer.writerow([l.customer_id, l.name, l.age, l.occupation, l.cibil_score,
                         l.income, l.ai_score, l.conversion_probability, l.priority,
                         l.recommended_loan, l.top_signal, l.explanation, l.created_at])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=idbi_leads_export.csv"},
    )


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)):
    return get_analytics(db)
