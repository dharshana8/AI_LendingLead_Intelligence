def get_priority(ai_score: float) -> str:
    if ai_score >= 80:
        return "High"
    elif ai_score >= 65:
        return "Medium"
    return "Low"


def recommend_loan(income: float, ai_score: float, repayment_capacity: float, intent_score: float) -> str:
    if income >= 80000 and repayment_capacity >= 50000:
        return "Home Loan"
    if income >= 60000 and repayment_capacity >= 30000 and ai_score >= 65:
        return "Mortgage Loan"
    if intent_score >= 0.6 and repayment_capacity >= 15000:
        return "Auto Loan"
    return "Personal Loan"


def get_top_signal(features: dict) -> str:
    scores = {
        "Salary Stability": features["salary_regularity"],
        "Savings Ratio": features["savings_ratio"],
        "Credit Health": features["credit_health"],
        "Loan Intent": features["intent_score"],
        "Low EMI Burden": 1.0 - features["emi_burden"],
    }
    return max(scores, key=scores.get)


def generate_explanation(features: dict, ai_score: float, top_signal: str) -> str:
    parts = []

    if features["salary_regularity"] >= 0.8:
        parts.append("Excellent salary consistency across six months.")
    elif features["salary_regularity"] >= 0.5:
        parts.append("Moderate salary regularity observed.")
    else:
        parts.append("Irregular salary credits detected.")

    if features["emi_burden"] <= 0.3:
        parts.append("Low EMI burden indicates strong repayment headroom.")
    elif features["emi_burden"] <= 0.5:
        parts.append("Moderate EMI obligations.")
    else:
        parts.append("High EMI burden may affect repayment capacity.")

    if features["savings_ratio"] >= 0.5:
        parts.append("Strong savings ratio reflects financial discipline.")
    elif features["savings_ratio"] >= 0.3:
        parts.append("Adequate savings margin.")

    if features["credit_health"] >= 0.7:
        parts.append("Healthy credit utilization.")
    elif features["credit_health"] >= 0.4:
        parts.append("Moderate credit card utilization.")
    else:
        parts.append("High credit card utilization is a risk signal.")

    if features["intent_score"] >= 0.6:
        parts.append("High loan intent based on page visit activity.")

    if ai_score >= 80:
        parts.append("High probability of loan conversion.")
    elif ai_score >= 65:
        parts.append("Moderate probability of loan conversion.")
    else:
        parts.append("Lower conversion likelihood; nurturing recommended.")

    return " ".join(parts)


def run_loan_engine(features: dict, ai_score: float) -> dict:
    priority = get_priority(ai_score)
    recommended_loan = recommend_loan(
        features["income"], ai_score,
        features["repayment_capacity"], features["intent_score"]
    )
    top_signal = get_top_signal(features)
    explanation = generate_explanation(features, ai_score, top_signal)
    return {
        "priority": priority,
        "recommended_loan": recommended_loan,
        "top_signal": top_signal,
        "explanation": explanation,
    }
