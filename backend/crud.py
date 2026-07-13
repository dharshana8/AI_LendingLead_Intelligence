from datetime import datetime
from database import leads_col, get_next_sequence_value
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

    return {
        **features,
        "ai_score": ml_result["ai_score"],
        "conversion_probability": ml_result["conversion_probability"],
        "shap_top3": ml_result.get("shap_top3", []),
        **engine_result,
    }


async def create_lead(payload: CustomerCreate) -> dict:
    raw = payload.model_dump()
    enriched = _enrich(raw)
    customer_id = await get_next_sequence_value("customer_id")
    
    lead = {
        **raw,
        **enriched,
        "customer_id": customer_id,
        "status": "New",
        "assigned_to": "",
        "last_contact": "",
        "created_at": datetime.utcnow()
    }
    await leads_col.insert_one(lead)
    return lead


async def get_leads(priority: str | None = None) -> list[dict]:
    query = {}
    if priority:
        query["priority"] = priority
    cursor = leads_col.find(query).sort("ai_score", -1)
    return await cursor.to_list(length=None)


async def get_lead(customer_id: int) -> dict | None:
    return await leads_col.find_one({"customer_id": customer_id})


async def delete_lead(customer_id: int) -> bool:
    res = await leads_col.delete_one({"customer_id": customer_id})
    return res.deleted_count > 0


CRM_ONLY_FIELDS = {"status", "assigned_to", "last_contact"}


async def update_lead(customer_id: int, payload: CustomerUpdate) -> dict | None:
    lead = await leads_col.find_one({"customer_id": customer_id})
    if not lead:
        return None
    
    updates = payload.model_dump(exclude_none=True)
    for k, v in updates.items():
        lead[k] = v
        
    if not updates.keys() <= CRM_ONLY_FIELDS:
        enriched = _enrich(lead)
        for k, v in enriched.items():
            lead[k] = v
            
    await leads_col.replace_one({"customer_id": customer_id}, lead)
    return lead

