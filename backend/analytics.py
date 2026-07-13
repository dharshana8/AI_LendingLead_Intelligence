from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Lead


AVG_LOAN_VALUE = 500000  # INR — used for potential business value estimate


def get_analytics(db: Session) -> dict:
    leads = db.query(Lead).all()
    total = len(leads)

    if total == 0:
        return {
            "total_leads": 0,
            "high_priority": 0,
            "medium_priority": 0,
            "low_priority": 0,
            "average_ai_score": 0.0,
            "average_conversion_probability": 0.0,
            "loan_distribution": {},
            "ai_vs_cibil": {},
            "potential_business_value": 0.0,
        }

    high = sum(1 for l in leads if l.priority == "High")
    medium = sum(1 for l in leads if l.priority == "Medium")
    low = sum(1 for l in leads if l.priority == "Low")

    avg_score = round(sum(l.ai_score for l in leads) / total, 2)
    avg_conv = round(sum(l.conversion_probability for l in leads) / total, 4)

    loan_dist: dict[str, int] = {}
    for l in leads:
        loan_dist[l.recommended_loan] = loan_dist.get(l.recommended_loan, 0) + 1

    # AI qualified: ai_score >= 65
    ai_qualified = sum(1 for l in leads if l.ai_score >= 65)
    # Traditional CIBIL qualified: cibil_score >= 700
    cibil_qualified = sum(1 for l in leads if l.cibil_score >= 700)
    improvement_pct = (
        round((ai_qualified - cibil_qualified) / cibil_qualified * 100, 1)
        if cibil_qualified > 0 else 0.0
    )

    potential_value = round(ai_qualified * avg_conv * AVG_LOAN_VALUE, 2)

    return {
        "total_leads": total,
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low,
        "average_ai_score": avg_score,
        "average_conversion_probability": avg_conv,
        "loan_distribution": loan_dist,
        "ai_vs_cibil": {
            "ai_qualified": ai_qualified,
            "cibil_qualified": cibil_qualified,
            "improvement_percent": improvement_pct,
        },
        "potential_business_value": potential_value,
    }
