from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Lead(Base):
    __tablename__ = "leads"

    customer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    occupation = Column(String, nullable=False)
    cibil_score = Column(Integer, nullable=False)

    # Raw salary credits
    monthly_credit_1 = Column(Float, default=0.0)
    monthly_credit_2 = Column(Float, default=0.0)
    monthly_credit_3 = Column(Float, default=0.0)
    monthly_credit_4 = Column(Float, default=0.0)
    monthly_credit_5 = Column(Float, default=0.0)
    monthly_credit_6 = Column(Float, default=0.0)

    # Raw financial inputs
    emi_debits = Column(Float, default=0.0)
    cc_spend = Column(Float, default=0.0)
    credit_limit = Column(Float, default=1.0)
    loan_page_visits = Column(Integer, default=0)
    existing_loan_count = Column(Integer, default=0)
    years_of_experience = Column(Integer, default=0)
    account_balance = Column(Float, default=0.0)

    # Derived features
    income = Column(Float, default=0.0)
    salary_regularity = Column(Float, default=0.0)
    emi_burden = Column(Float, default=0.0)
    savings_ratio = Column(Float, default=0.0)
    credit_health = Column(Float, default=0.0)
    intent_score = Column(Float, default=0.0)
    repayment_capacity = Column(Float, default=0.0)
    debt_ratio = Column(Float, default=0.0)

    # ML predictions
    ai_score = Column(Float, default=0.0)
    conversion_probability = Column(Float, default=0.0)
    priority = Column(String, default="Low")
    recommended_loan = Column(String, default="")
    top_signal = Column(String, default="")
    explanation = Column(String, default="")
    shap_top3 = Column(Text, default="[]")

    # CRM fields
    status = Column(String, default="New")
    assigned_to = Column(String, default="")
    last_contact = Column(String, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
