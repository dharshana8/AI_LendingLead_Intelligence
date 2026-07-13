"""
ml_model.py
-----------
Thin adapter used by crud.py.
Delegates all prediction to predict.py which loads the real trained model.
"""

from predict import predict_customer, FEATURES  # noqa: F401


def predict(features: dict) -> dict:
    """
    Accepts the derived-feature dict produced by feature_engineering.py
    plus cibil_score, maps keys to the training feature names, and
    returns {ai_score, conversion_probability}.
    """
    payload = {
        "Age":                  features.get("age", 0),
        "Monthly_Income":       features.get("income", 0),
        "CIBIL_Score":          features.get("cibil_score", 0),
        "EMI_Burden":           features.get("emi_burden", 0),
        "Savings_Ratio":        features.get("savings_ratio", 0),
        "Credit_Health":        features.get("credit_health", 0),
        "Repayment_Capacity":   features.get("repayment_capacity", 0),
        "Debt_Ratio":           features.get("debt_ratio", 0),
        "Existing_Loan_Count":  features.get("existing_loan_count", 0),
        "Years_of_Experience":  features.get("years_of_experience", 0),
        "Account_Balance":      features.get("account_balance", 0),
    }
    result = predict_customer(payload)
    return {
        "ai_score": result["ai_score"],
        "conversion_probability": result["conversion_probability"],
        "shap_top3": result.get("shap_top3", []),
    }
