"""
predict.py
----------
Exposes predict_customer(data: dict) for use by the FastAPI backend.
Loads rf_model.pkl, scaler.pkl, and shap_explainer.pkl once at module
level (cached). Returns ai_score, conversion_probability, prediction,
and top-3 SHAP-driven feature explanations per customer.
"""

import os
import joblib
import numpy as np
from typing import Any

# ---------------------------------------------------------------------------
# Feature order must match train_model.py FEATURES list exactly
# ---------------------------------------------------------------------------
FEATURES: list[str] = [
    "Age",
    "Monthly_Income",
    "CIBIL_Score",
    "EMI_Burden",
    "Savings_Ratio",
    "Credit_Health",
    "Repayment_Capacity",
    "Debt_Ratio",
    "Existing_Loan_Count",
    "Years_of_Experience",
    "Account_Balance",
]

_BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH    = os.path.join(_BASE_DIR, "rf_model.pkl")
SCALER_PATH   = os.path.join(_BASE_DIR, "scaler.pkl")
EXPLAINER_PATH = os.path.join(_BASE_DIR, "shap_explainer.pkl")

# Module-level cache
_model: Any    = None
_scaler: Any   = None
_explainer: Any = None


def _load_artefacts() -> tuple:
    global _model, _scaler, _explainer

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train_model.py first.")
        _model = joblib.load(MODEL_PATH)

    if _scaler is None:
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}. Run train_model.py first.")
        _scaler = joblib.load(SCALER_PATH)

    if _explainer is None:
        if not os.path.exists(EXPLAINER_PATH):
            raise FileNotFoundError(f"SHAP explainer not found at {EXPLAINER_PATH}. Run train_model.py first.")
        _explainer = joblib.load(EXPLAINER_PATH)

    return _model, _scaler, _explainer


def _build_feature_vector(data: dict) -> np.ndarray:
    try:
        vector = [float(data[feat]) for feat in FEATURES]
    except KeyError as e:
        raise KeyError(f"Missing required feature: {e}") from e
    except (TypeError, ValueError) as e:
        raise ValueError(f"Non-numeric value in features: {e}") from e
    return np.array(vector, dtype=np.float64).reshape(1, -1)


def _get_shap_top3(explainer: Any, scaled_vector: np.ndarray) -> list[dict]:
    """
    Compute SHAP values for the single customer vector and return
    the top-3 features by absolute SHAP value for class=1 (Approved).

    Handles all TreeExplainer output shapes:
      - list of arrays  : [class0(n,f), class1(n,f)]
      - 3-D array       : (n_samples, n_features, n_classes)
      - 2-D array       : (n_samples, n_features)  — single output
    """
    shap_values = explainer.shap_values(scaled_vector)
    arr = np.array(shap_values)

    if isinstance(shap_values, list):
        # list[class0_array, class1_array], each shape (n_samples, n_features)
        vals = np.array(shap_values[1])[0]
    elif arr.ndim == 3:
        # shape (n_samples, n_features, n_classes) — take class=1
        vals = arr[0, :, 1]
    else:
        # shape (n_samples, n_features)
        vals = arr[0]

    top_indices = np.argsort(np.abs(vals))[::-1][:3]
    result = []
    for idx in top_indices:
        v = float(vals[idx])
        result.append({
            "feature": FEATURES[idx],
            "shap_value": round(v, 4),
            "direction": "positive" if v > 0 else "negative",
        })
    return result


def predict_customer(data: dict) -> dict:
    """
    Predict loan approval for a single customer.

    Parameters
    ----------
    data : dict
        Must contain all keys in FEATURES with numeric values.

    Returns
    -------
    dict:
        ai_score              : float  (0-100)
        conversion_probability: float  (0-1)
        prediction            : str    ("Approved" | "Rejected")
        shap_top3             : list   top-3 SHAP feature contributions
    """
    model, scaler, explainer = _load_artefacts()

    raw_vector    = _build_feature_vector(data)
    scaled_vector = scaler.transform(raw_vector)

    proba                  = model.predict_proba(scaled_vector)[0]
    conversion_probability = float(proba[1])
    ai_score               = round(conversion_probability * 100, 2)
    prediction             = "Approved" if model.predict(scaled_vector)[0] == 1 else "Rejected"
    shap_top3              = _get_shap_top3(explainer, scaled_vector)

    return {
        "ai_score": ai_score,
        "conversion_probability": round(conversion_probability, 4),
        "prediction": prediction,
        "shap_top3": shap_top3,
    }
