"""
loan_engine.py — Multi-product loan recommendation engine.

Design decisions flagged for business/lending-policy confirmation:
  - RETIREMENT_AGE_CUTOFF: default 65 — make it a constant, not inline.
  - Loan amount: always null until lending-policy confirms formulas (Part D item 16).
  - Occupation-category eligibility thresholds: placeholder eligible=True with
    amount=null until Part D item 17 is confirmed.
  - Home Loan vs Mortgage Loan tie-break: Home Loan wins (primary) when both
    income thresholds are met — flag this for business confirmation.
"""

from datetime import datetime

# ── Configurable constants ────────────────────────────────────────────────────
RETIREMENT_AGE_CUTOFF = 65  # years — loans whose tenure would exceed this are flagged

# Typical maximum tenures per product (years) — used for age eligibility check
LOAN_MAX_TENURE: dict[str, int] = {
    "Home Loan":           20,
    "Loan Against Property": 15,
    "Home Improvement Loan": 10,
    "Mortgage Loan":       15,
    "Auto Loan":           7,
    "Personal Loan":       5,
    "Gold Loan":           3,
    "Education Loan":      10,
    "Agricultural Loan":   7,
    "Fisheries Scheme Loan": 7,
    "Business/MSME Loan":  10,
}

# ── Occupation-category routing config ───────────────────────────────────────
# Each entry: {primary_loan, eligibility_fn, note}
# eligibility_fn receives (features, ai_score) and returns True/False.
# Thresholds are placeholders (always True) until Part D item 17 is confirmed.
def _placeholder_eligible(features: dict, ai_score: float) -> bool:
    return True  # Replace with real criteria once lending-policy confirms


OCCUPATION_LOAN_CONFIG: dict[str, dict] = {
    "Student": {
        "primary": "Education Loan",
        "eligible": _placeholder_eligible,
        "note": "Eligibility criteria (course cost, institution type) pending lending-policy confirmation",
    },
    "Farmer": {
        "primary": "Agricultural Loan",
        "eligible": _placeholder_eligible,
        "note": "Eligibility criteria (land holding, crop type) pending lending-policy confirmation",
    },
    "Fisherman": {
        "primary": "Fisheries Scheme Loan",
        "eligible": _placeholder_eligible,
        "note": "Eligibility criteria pending lending-policy confirmation",
    },
    "Business-Owner": {
        "primary": "Business/MSME Loan",
        "eligible": _placeholder_eligible,
        "note": "Eligibility criteria (turnover, GST registration) pending lending-policy confirmation",
    },
}


# ── Priority ──────────────────────────────────────────────────────────────────
def get_priority(ai_score: float) -> str:
    if ai_score >= 80:
        return "High"
    elif ai_score >= 65:
        return "Medium"
    return "Low"


# ── Age eligibility ───────────────────────────────────────────────────────────
def _age_eligible(age: int, loan_type: str) -> tuple[bool, str]:
    """
    Returns (eligible, note).
    If age + max_tenure > RETIREMENT_AGE_CUTOFF, the loan is flagged rather
    than silently recommended.
    """
    tenure = LOAN_MAX_TENURE.get(loan_type, 10)
    if age + tenure > RETIREMENT_AGE_CUTOFF:
        remaining = max(RETIREMENT_AGE_CUTOFF - age, 0)
        if remaining <= 0:
            return False, f"Customer age {age} exceeds retirement cutoff for {loan_type}"
        return True, f"Requires shorter tenure (max {remaining} yrs due to retirement cutoff)"
    return True, ""


# ── Income-based waterfall (for non-occupation-routed categories) ─────────────
def _income_waterfall(
    income: float,
    ai_score: float,
    repayment_capacity: float,
    owns_home: bool,
    has_existing_home_loan: bool,
) -> list[dict]:
    """
    Evaluates ALL matching income/repayment conditions and returns every
    qualifying product. Does NOT stop at first match.

    Returns list of {loan, note} dicts ordered by business priority.
    Tie-break: Home Loan > Mortgage Loan > Auto Loan > Personal Loan
    (flag this ordering for business confirmation).
    """
    results = []

    # Home Loan — only if customer does NOT already own a home
    if not owns_home and not has_existing_home_loan:
        if income >= 80000 and repayment_capacity >= 50000:
            results.append({"loan": "Home Loan", "note": ""})
    else:
        # Owns home → property-based alternatives
        if income >= 60000 and repayment_capacity >= 30000:
            results.append({"loan": "Loan Against Property", "note": "Customer owns home — LAP recommended over fresh Home Loan"})
        if income >= 30000 and repayment_capacity >= 15000:
            results.append({"loan": "Home Improvement Loan", "note": "Customer owns home — improvement loan eligible"})

    # Mortgage Loan
    if income >= 60000 and repayment_capacity >= 30000 and ai_score >= 65:
        results.append({"loan": "Mortgage Loan", "note": ""})

    # Auto Loan
    if repayment_capacity >= 15000 and income >= 30000:
        results.append({"loan": "Auto Loan", "note": ""})

    # Personal Loan — always a fallback
    results.append({"loan": "Personal Loan", "note": ""})

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for r in results:
        if r["loan"] not in seen:
            seen.add(r["loan"])
            deduped.append(r)
    return deduped


# ── SHAP signal mapping ───────────────────────────────────────────────────────
_SHAP_FEATURE_TO_SIGNAL = {
    "CIBIL_Score":         "CIBIL Score",
    "Monthly_Income":      "Monthly Income",
    "EMI_Burden":          "EMI Burden",
    "Savings_Ratio":       "Savings Ratio",
    "Credit_Health":       "Credit Health",
    "Repayment_Capacity":  "Repayment Capacity",
    "Debt_Ratio":          "Debt Ratio",
    "Existing_Loan_Count": "Existing Loans",
    "Years_of_Experience": "Work Experience",
    "Account_Balance":     "Account Balance",
    "Age":                 "Customer Age",
}


def get_top_signal(features: dict, shap_top3: list | None = None) -> str:
    if shap_top3:
        top_feature = shap_top3[0].get("feature", "")
        if top_feature in _SHAP_FEATURE_TO_SIGNAL:
            return _SHAP_FEATURE_TO_SIGNAL[top_feature]
    scores = {
        "Salary Stability": features["salary_regularity"],
        "Savings Ratio":    features["savings_ratio"],
        "Credit Health":    features["credit_health"],
        "Loan Intent":      features["intent_score"],
        "Low EMI Burden":   1.0 - features["emi_burden"],
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

    if ai_score >= 80:
        parts.append("High probability of loan conversion.")
    elif ai_score >= 65:
        parts.append("Moderate probability of loan conversion.")
    else:
        parts.append("Lower conversion likelihood; nurturing recommended.")

    return " ".join(parts)


# ── Main engine ───────────────────────────────────────────────────────────────
def run_loan_engine(
    features: dict,
    ai_score: float,
    shap_top3: list | None = None,
    occupation_category: str = "Salaried",
    age: int = 35,
    owns_home: bool = False,
    has_existing_home_loan: bool = False,
    has_gold_to_pledge: bool = False,
) -> dict:
    priority = get_priority(ai_score)
    top_signal = get_top_signal(features, shap_top3)
    explanation = generate_explanation(features, ai_score, top_signal)

    # ── Step 1: occupation-category routing ──────────────────────────────────
    occ_config = OCCUPATION_LOAN_CONFIG.get(occupation_category)
    if occ_config and occ_config["eligible"](features, ai_score):
        primary_loan = occ_config["primary"]
        also_eligible: list[str] = []
        # Occupation-routed loans: amount=null (no confirmed formula)
    else:
        # ── Step 2: income/repayment waterfall (all matching products) ────────
        waterfall = _income_waterfall(
            features["income"], ai_score, features["repayment_capacity"],
            owns_home, has_existing_home_loan,
        )
        primary_loan = waterfall[0]["loan"]
        also_eligible = [w["loan"] for w in waterfall[1:]]

    # ── Step 3: age eligibility check ────────────────────────────────────────
    age_ok, age_note = _age_eligible(age, primary_loan)
    if not age_ok:
        # Primary is ineligible due to age — demote to next in also_eligible
        if also_eligible:
            primary_loan = also_eligible.pop(0)
            age_ok2, age_note2 = _age_eligible(age, primary_loan)
            if not age_ok2:
                primary_loan = "Personal Loan"
                also_eligible = []
        else:
            primary_loan = "Personal Loan"
    elif age_note:
        explanation = f"{explanation} Note: {age_note}."

    # Filter also_eligible for age too
    also_eligible = [
        l for l in also_eligible
        if _age_eligible(age, l)[0] and l != primary_loan
    ]

    # ── Step 4: Gold Loan as parallel collateral option ───────────────────────
    # Gold Loan is collateral-based — it doesn't compete in the income waterfall.
    # Always surface it alongside the primary if customer has gold to pledge.
    collateral_option: str | None = "Gold Loan" if has_gold_to_pledge else None

    return {
        "priority": priority,
        "recommended_loan": primary_loan,
        "also_eligible": also_eligible,
        "collateral_option": collateral_option,
        "top_signal": top_signal,
        "explanation": explanation,
    }
