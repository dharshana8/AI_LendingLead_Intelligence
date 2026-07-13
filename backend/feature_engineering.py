import statistics


def _nonzero_credits(data: dict) -> list[float]:
    return [
        v for k, v in data.items()
        if k.startswith("monthly_credit_") and v > 0
    ]


def compute_income(data: dict) -> float:
    credits = _nonzero_credits(data)
    return statistics.median(credits) if credits else 0.0


def compute_salary_regularity(data: dict) -> float:
    credits = _nonzero_credits(data)
    if len(credits) < 2:
        return float(len(credits))
    mean = statistics.mean(credits)
    if mean == 0:
        return 0.0
    cv = statistics.stdev(credits) / mean
    return round(min(max(1.0 - cv, 0.0), 1.0), 4)


def compute_emi_burden(income: float, emi: float) -> float:
    if income <= 0:
        return 1.0
    return round(min(emi / income, 1.0), 4)


def compute_savings_ratio(income: float, emi: float) -> float:
    if income <= 0:
        return 0.0
    return round(max((income - emi) / income, 0.0), 4)


def compute_credit_health(cc_spend: float, credit_limit: float) -> float:
    if credit_limit <= 0:
        return 0.0
    return round(max(1.0 - cc_spend / credit_limit, 0.0), 4)


def compute_intent_score(loan_page_visits: int) -> float:
    return round(min(loan_page_visits / 10.0, 1.0), 4)


def compute_repayment_capacity(income: float, emi: float) -> float:
    return round(max(income - emi, 0.0), 2)


def compute_debt_ratio(emi: float, income: float) -> float:
    if income <= 0:
        return 0.0
    return round((emi / income) * 100, 4)


def derive_features(data: dict) -> dict:
    income = compute_income(data)
    emi = data.get("emi_debits", 0.0)
    cc_spend = data.get("cc_spend", 0.0)
    credit_limit = data.get("credit_limit", 1.0)
    loan_visits = data.get("loan_page_visits", 0)

    return {
        "income": income,
        "salary_regularity": compute_salary_regularity(data),
        "emi_burden": compute_emi_burden(income, emi),
        "savings_ratio": compute_savings_ratio(income, emi),
        "credit_health": compute_credit_health(cc_spend, credit_limit),
        "intent_score": compute_intent_score(loan_visits),
        "repayment_capacity": compute_repayment_capacity(income, emi),
        "debt_ratio": compute_debt_ratio(emi, income),
    }
