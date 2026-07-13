import json
from sqlalchemy.orm import Session
from models import Lead
from schemas import CustomerCreate, CustomerUpdate
from feature_engineering import derive_features
from ml_model import predict
from loan_engine import run_loan_engine


def _enrich(data: dict) -> dict:
    features = derive_features(data)
    ml_input = {
        **features,
        "cibil_score": data["cibil_score"],
        "age": data["age"],
        "existing_loan_count": data.get("existing_loan_count", 0),
        "years_of_experience": data.get("years_of_experience", 0),
        "account_balance": data.get("account_balance", 0.0),
    }
    ml_result = predict(ml_input)
    engine_result = run_loan_engine(features, ml_result["ai_score"])

    # Serialize shap_top3 list to JSON string for Text column storage
    shap_top3_json = json.dumps(ml_result.get("shap_top3", []))

    return {
        **features,
        "ai_score": ml_result["ai_score"],
        "conversion_probability": ml_result["conversion_probability"],
        "shap_top3": shap_top3_json,
        **engine_result,
    }


def _deserialize_lead(lead: Lead) -> Lead:
    """Deserialize shap_top3 from JSON string back to list for API response."""
    if isinstance(lead.shap_top3, str):
        try:
            lead.shap_top3 = json.loads(lead.shap_top3)
        except (json.JSONDecodeError, TypeError):
            lead.shap_top3 = []
    return lead


def create_lead(db: Session, payload: CustomerCreate) -> Lead:
    raw = payload.model_dump()
    enriched = _enrich(raw)
    lead = Lead(**raw, **enriched)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return _deserialize_lead(lead)


def get_leads(db: Session, priority: str | None = None) -> list[Lead]:
    q = db.query(Lead)
    if priority:
        q = q.filter(Lead.priority == priority)
    leads = q.order_by(Lead.ai_score.desc()).all()
    return [_deserialize_lead(l) for l in leads]


def get_lead(db: Session, customer_id: int) -> Lead | None:
    lead = db.query(Lead).filter(Lead.customer_id == customer_id).first()
    return _deserialize_lead(lead) if lead else None


def delete_lead(db: Session, customer_id: int) -> bool:
    lead = db.query(Lead).filter(Lead.customer_id == customer_id).first()
    if not lead:
        return False
    db.delete(lead)
    db.commit()
    return True


CRM_ONLY_FIELDS = {"status", "assigned_to", "last_contact"}


def update_lead(db: Session, customer_id: int, payload: CustomerUpdate) -> Lead | None:
    lead = db.query(Lead).filter(Lead.customer_id == customer_id).first()
    if not lead:
        return None
    updates = payload.model_dump(exclude_none=True)
    for k, v in updates.items():
        setattr(lead, k, v)
    # Only re-run ML pipeline if financial fields changed
    if not updates.keys() <= CRM_ONLY_FIELDS:
        raw = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        enriched = _enrich(raw)
        for k, v in enriched.items():
            setattr(lead, k, v)
    db.commit()
    db.refresh(lead)
    return _deserialize_lead(lead)
