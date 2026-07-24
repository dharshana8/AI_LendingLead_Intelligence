from database import leads_col


AVG_LOAN_VALUE = 500000  # INR — used for potential business value estimate


async def get_analytics() -> dict:
    cursor = leads_col.find({})
    leads = await cursor.to_list(length=None)
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
            "funnel": [],
        }

    high = sum(1 for l in leads if l.get("priority") == "High")
    medium = sum(1 for l in leads if l.get("priority") == "Medium")
    low = sum(1 for l in leads if l.get("priority") == "Low")

    avg_score = round(sum(l.get("ai_score", 0.0) for l in leads) / total, 2)
    avg_conv = round(sum(l.get("conversion_probability", 0.0) for l in leads) / total, 4)

    loan_dist: dict[str, int] = {}
    for l in leads:
        loan = l.get("recommended_loan", "")
        loan_dist[loan] = loan_dist.get(loan, 0) + 1

    # Conversion funnel — strict subset counts by status
    ai_qualified = sum(1 for l in leads if l.get("ai_score", 0.0) >= 65)
    contacted    = sum(1 for l in leads if l.get("status") in ("Contacted", "Interested", "Applied", "Converted"))
    interested   = sum(1 for l in leads if l.get("status") in ("Interested", "Applied", "Converted"))
    applied      = sum(1 for l in leads if l.get("status") in ("Applied", "Converted"))
    converted    = sum(1 for l in leads if l.get("status") == "Converted")

    funnel = [
        {"stage": "Total Leads",  "count": total,        "color": "#0E1A2B"},
        {"stage": "AI Qualified", "count": ai_qualified, "color": "#C79A3D"},
        {"stage": "Contacted",    "count": contacted,    "color": "#2F6E63"},
        {"stage": "Interested",   "count": interested,   "color": "#2F6E63"},
        {"stage": "Applied",      "count": applied,      "color": "#C79A3D"},
        {"stage": "Converted",    "count": converted,    "color": "#2F6E63"},
    ]

    # Traditional CIBIL qualified: cibil_score >= 700
    cibil_qualified = sum(1 for l in leads if l.get("cibil_score", 0) >= 700)
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
        "funnel": funnel,
    }
