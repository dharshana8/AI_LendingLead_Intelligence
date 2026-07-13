# MongoDB needs no ORM models — collections are schema-less.
# Field definitions are documented here for reference only.

LEAD_FIELDS = [
    "name", "age", "occupation", "cibil_score",
    "monthly_credit_1", "monthly_credit_2", "monthly_credit_3",
    "monthly_credit_4", "monthly_credit_5", "monthly_credit_6",
    "emi_debits", "cc_spend", "credit_limit", "loan_page_visits",
    "existing_loan_count", "years_of_experience", "account_balance",
    "income", "salary_regularity", "emi_burden", "savings_ratio",
    "credit_health", "intent_score", "repayment_capacity", "debt_ratio",
    "ai_score", "conversion_probability", "priority", "recommended_loan",
    "top_signal", "explanation", "shap_top3",
    "status", "assigned_to", "last_contact", "created_at",
]

USER_FIELDS = [
    "employee_id", "password", "name", "role", "branch",
    "email", "phone", "avatar", "joined", "performance",
]
