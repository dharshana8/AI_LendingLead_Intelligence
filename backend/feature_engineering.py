import statistics

# Per-loan estimated monthly obligation used to discount repayment capacity
# for each additional existing loan beyond the first.
_EXISTING_LOAN_MONTHLY_OBLIGATION = 5000.0  # INR — conservative placeholder

# Maximum experience-based regularity bonus (caps at 5% uplift for 10+ years)
_MAX_EXPERIENCE_REGULARITY_BONUS = 0.05


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
        base = float(len(credits))
    else:
        mean = statistics.mean(credits)
        if mean == 0:
            base = 0.0
        else:
            cv = statistics.stdev(credits) / mean
            base = min(max(1.0 - cv, 0.0), 1.0)

    # Years-of-experience nudge: longer tenure → slightly higher confidence
    # in salary regularity. Bonus scales linearly up to 10 years, then caps.
    years = data.get("years_of_experience", 0) or 0
    bonus = min(years / 10.0, 1.0) * _MAX_EXPERIENCE_REGULARITY_BONUS
    return round(min(base + bonus, 1.0), 4)


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


def compute_repayment_capacity(income: float, emi: float, existing_loan_count: int = 0) -> float:
    """
    Effective repayment headroom after existing EMI obligations.
    Each existing loan beyond the first reduces capacity by a fixed
    estimated monthly obligation (conservative placeholder — replace with
    actual average obligation once lending-policy confirms the figure).
    """
    extra_obligation = max(existing_loan_count - 1, 0) * _EXISTING_LOAN_MONTHLY_OBLIGATION
    return round(max(income - emi - extra_obligation, 0.0), 2)


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
    existing_loans = data.get("existing_loan_count", 0)

    return {
        "income": income,
        "salary_regularity": compute_salary_regularity(data),
        "emi_burden": compute_emi_burden(income, emi),
        "savings_ratio": compute_savings_ratio(income, emi),
        "credit_health": compute_credit_health(cc_spend, credit_limit),
        "intent_score": compute_intent_score(loan_visits),
        "repayment_capacity": compute_repayment_capacity(income, emi, existing_loans),
        "debt_ratio": compute_debt_ratio(emi, income),
    }
