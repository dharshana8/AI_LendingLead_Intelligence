from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str
    age: int = Field(..., ge=18, le=80)
    occupation: str
    cibil_score: int = Field(..., ge=300, le=900)
    monthly_credit_1: float = Field(default=0.0, ge=0)
    monthly_credit_2: float = Field(default=0.0, ge=0)
    monthly_credit_3: float = Field(default=0.0, ge=0)
    monthly_credit_4: float = Field(default=0.0, ge=0)
    monthly_credit_5: float = Field(default=0.0, ge=0)
    monthly_credit_6: float = Field(default=0.0, ge=0)
    emi_debits: float = Field(default=0.0, ge=0)
    cc_spend: float = Field(default=0.0, ge=0)
    credit_limit: float = Field(default=1.0, gt=0)
    loan_page_visits: int = Field(default=0, ge=0)
    existing_loan_count: int = Field(default=0, ge=0)
    years_of_experience: int = Field(default=0, ge=0)
    account_balance: float = Field(default=0.0, ge=0)

    @model_validator(mode="after")
    def validate_min_credits(self):
        credits = [
            self.monthly_credit_1, self.monthly_credit_2, self.monthly_credit_3,
            self.monthly_credit_4, self.monthly_credit_5, self.monthly_credit_6,
        ]
        if sum(1 for c in credits if c > 0) < 3:
            raise ValueError("At least 3 monthly salary credits must be non-zero.")
        return self


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=18, le=80)
    occupation: Optional[str] = None
    cibil_score: Optional[int] = Field(default=None, ge=300, le=900)
    monthly_credit_1: Optional[float] = Field(default=None, ge=0)
    monthly_credit_2: Optional[float] = Field(default=None, ge=0)
    monthly_credit_3: Optional[float] = Field(default=None, ge=0)
    monthly_credit_4: Optional[float] = Field(default=None, ge=0)
    monthly_credit_5: Optional[float] = Field(default=None, ge=0)
    monthly_credit_6: Optional[float] = Field(default=None, ge=0)
    emi_debits: Optional[float] = Field(default=None, ge=0)
    cc_spend: Optional[float] = Field(default=None, ge=0)
    credit_limit: Optional[float] = Field(default=None, gt=0)
    loan_page_visits: Optional[int] = Field(default=None, ge=0)
    existing_loan_count: Optional[int] = Field(default=None, ge=0)
    years_of_experience: Optional[int] = Field(default=None, ge=0)
    account_balance: Optional[float] = Field(default=None, ge=0)


class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    age: int
    occupation: str
    cibil_score: int
    monthly_credit_1: float
    monthly_credit_2: float
    monthly_credit_3: float
    monthly_credit_4: float
    monthly_credit_5: float
    monthly_credit_6: float
    emi_debits: float
    cc_spend: float
    credit_limit: float
    loan_page_visits: int
    existing_loan_count: int
    years_of_experience: int
    account_balance: float
    income: float
    salary_regularity: float
    emi_burden: float
    savings_ratio: float
    credit_health: float
    intent_score: float
    repayment_capacity: float
    debt_ratio: float
    ai_score: float
    conversion_probability: float
    priority: str
    recommended_loan: str
    top_signal: str
    explanation: str
    shap_top3: Any  # list of {feature, shap_value, direction}
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsResponse(BaseModel):
    total_leads: int
    high_priority: int
    medium_priority: int
    low_priority: int
    average_ai_score: float
    average_conversion_probability: float
    loan_distribution: dict
    ai_vs_cibil: dict
    potential_business_value: float
