from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any, List
from datetime import datetime

OCCUPATION_CATEGORIES = [
    "Salaried",
    "Self-Employed-Professional",
    "Business-Owner",
    "Farmer",
    "Fisherman",
    "Student",
    "Other",
]


class CustomerCreate(BaseModel):
    model_config = {"extra": "ignore"}

    name: str
    age: int = Field(..., ge=18, le=80)
    occupation: str  # free-text display field
    occupation_category: str = "Salaried"  # enum drives routing logic
    assigned_to: str = ""
    branch: str = ""
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
    # New property flags (Part B item 7)
    owns_home: bool = False
    has_existing_home_loan: bool = False
    has_gold_to_pledge: bool = False
    # cibil_verified_at: null until real bureau check is wired (Part D item 16)
    cibil_verified_at: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_min_credits(self):
        credits = [
            self.monthly_credit_1, self.monthly_credit_2, self.monthly_credit_3,
            self.monthly_credit_4, self.monthly_credit_5, self.monthly_credit_6,
        ]
        if sum(1 for c in credits if c > 0) < 3:
            raise ValueError("At least 3 monthly salary credits must be non-zero.")
        return self

    @model_validator(mode="after")
    def validate_occupation_category(self):
        if self.occupation_category not in OCCUPATION_CATEGORIES:
            self.occupation_category = "Other"
        return self


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=18, le=80)
    occupation: Optional[str] = None
    occupation_category: Optional[str] = None
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
    owns_home: Optional[bool] = None
    has_existing_home_loan: Optional[bool] = None
    has_gold_to_pledge: Optional[bool] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    last_contact: Optional[str] = None
    followup_date: Optional[str] = None
    followup_time: Optional[str] = None
    call_outcome: Optional[str] = None
    call_notes: Optional[str] = None
    branch: Optional[str] = None


class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    age: int
    occupation: str
    occupation_category: str = "Salaried"
    branch: str = ""
    cibil_score: int
    cibil_verified_at: Optional[datetime] = None
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
    owns_home: bool = False
    has_existing_home_loan: bool = False
    has_gold_to_pledge: bool = False
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
    also_eligible: List[str] = []
    collateral_option: Optional[str] = None
    top_signal: str
    explanation: str
    shap_top3: Any
    model_version: str = ""
    scored_at: Optional[datetime] = None
    status: str
    assigned_to: str
    last_contact: str
    followup_date: Optional[str] = None
    followup_time: Optional[str] = None
    call_outcome: Optional[str] = None
    call_notes: Optional[str] = None
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
    funnel: list


class UserSettingsRequest(BaseModel):
    notifications_email:      Optional[bool] = None
    notifications_sms:        Optional[bool] = None
    notifications_push:       Optional[bool] = None
    notifications_lead_alert: Optional[bool] = None
    notifications_approvals:  Optional[bool] = None
    notifications_reminders:  Optional[bool] = None
    dark_mode:    Optional[bool] = None
    language:     Optional[str] = None
    font_size:    Optional[str] = None
    date_format:  Optional[str] = None
    # Password change — validated server-side
    current_password: Optional[str] = None
    password:         Optional[str] = None
    # Accessibility
    high_contrast:  Optional[bool] = None
    reduce_motion:  Optional[bool] = None
    large_text:     Optional[bool] = None
    screen_reader:  Optional[bool] = None
