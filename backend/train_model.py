"""
train_model.py
--------------
Loads the IDBI dataset, cleans it, trains a RandomForestClassifier,
evaluates it with SHAP, saves:
  - rf_model.pkl
  - scaler.pkl
  - shap_explainer.pkl
  - feature_importance.png
  - confusion_matrix.png
  - roc_curve.png

Run from the backend directory:
    python train_model.py
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # non-interactive backend for file saving
import matplotlib.pyplot as plt
import seaborn as sns
import shap

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    classification_report, roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(_DIR, "..", "idbi_ai_lending_training_dataset_20000.xlsx")
MODEL_OUT     = os.path.join(_DIR, "rf_model.pkl")
SCALER_OUT    = os.path.join(_DIR, "scaler.pkl")
EXPLAINER_OUT = os.path.join(_DIR, "shap_explainer.pkl")
FIG_DIR       = _DIR   # save PNGs alongside the model files

TARGET = "Loan_Approved"

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

RF_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": 20,
    "min_samples_split": 5,
    "min_samples_leaf": 2,
    "max_features": "sqrt",
    "class_weight": "balanced",
    "random_state": 42,
    "n_jobs": -1,
}

PLOT_STYLE = "seaborn-v0_8-whitegrid"


# ---------------------------------------------------------------------------
# Step 1 — Load
# ---------------------------------------------------------------------------
def load_dataset(path: str) -> pd.DataFrame:
    print("[1/6] Loading dataset ...")
    if not os.path.exists(path):
        sys.exit(f"ERROR: Dataset not found at {path}")
    df = pd.read_excel(path, engine="openpyxl")
    print(f"      Loaded {len(df):,} rows x {len(df.columns)} columns.")
    return df


# ---------------------------------------------------------------------------
# Step 2 — Clean
# ---------------------------------------------------------------------------
def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    print("[2/6] Cleaning dataset ...")
    before = len(df)
    df = df.drop_duplicates()
    print(f"      Duplicates removed  : {before - len(df)}")

    required = FEATURES + [TARGET]
    missing = [c for c in required if c not in df.columns]
    if missing:
        sys.exit(f"ERROR: Missing columns: {missing}")
    df = df[required].copy()

    before = len(df)
    df = df.dropna(subset=required)
    print(f"      Null rows dropped   : {before - len(df)}")

    for col in FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    before = len(df)
    df = df.dropna(subset=FEATURES)
    print(f"      Non-numeric rows    : {before - len(df)}")

    invalid = ~df[TARGET].isin([0, 1])
    df = df[~invalid]
    print(f"      Invalid target rows : {invalid.sum()}")
    print(f"      Final clean rows    : {len(df):,}")
    return df.reset_index(drop=True)


# ---------------------------------------------------------------------------
# Step 3 — Split + Scale
# ---------------------------------------------------------------------------
def prepare_data(df: pd.DataFrame) -> tuple:
    print("[3/6] Splitting and scaling ...")
    X = df[FEATURES].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    print(f"      Train: {len(X_train):,}  |  Test: {len(X_test):,}")
    print(f"      Approved (train): {y_train.sum():,}  |  Rejected: {(y_train==0).sum():,}")
    return X_train_s, X_test_s, y_train, y_test, scaler


# ---------------------------------------------------------------------------
# Step 4 — Train
# ---------------------------------------------------------------------------
def train(X_train: np.ndarray, y_train: np.ndarray) -> RandomForestClassifier:
    print("[4/6] Training RandomForestClassifier ...")
    model = RandomForestClassifier(**RF_PARAMS)
    model.fit(X_train, y_train)
    print("      Training complete.")
    return model


# ---------------------------------------------------------------------------
# Step 5 — Evaluate + Visualize
# ---------------------------------------------------------------------------
def evaluate_and_plot(
    model: RandomForestClassifier,
    X_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> shap.TreeExplainer:
    print("[5/6] Evaluating and generating plots ...")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    f1        = f1_score(y_test, y_pred, zero_division=0)
    roc_auc   = roc_auc_score(y_test, y_prob)
    cm        = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 52)
    print("  MODEL EVALUATION REPORT")
    print("=" * 52)
    print(f"  Accuracy  : {accuracy:.4f}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  ROC-AUC   : {roc_auc:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"    TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"    FN={cm[1,0]}  TP={cm[1,1]}")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Rejected", "Approved"]))

    # --- Plot 1: Feature Importance ---
    _plot_feature_importance(model)

    # --- Plot 2: Confusion Matrix ---
    _plot_confusion_matrix(cm)

    # --- Plot 3: ROC Curve ---
    _plot_roc_curve(y_test, y_prob, roc_auc)

    # --- SHAP TreeExplainer (fit on training data) ---
    print("      Building SHAP TreeExplainer on training set (this may take ~30s) ...")
    explainer = shap.TreeExplainer(model, data=X_train, feature_perturbation="interventional")
    print("      SHAP explainer ready.")
    return explainer


def _plot_feature_importance(model: RandomForestClassifier) -> None:
    importances = model.feature_importances_
    indices = np.argsort(importances)
    feat_names = [FEATURES[i] for i in indices]
    vals = importances[indices]

    plt.style.use(PLOT_STYLE)
    fig, ax = plt.subplots(figsize=(9, 6))
    colors = ["#1a6faf" if v < max(vals) * 0.5 else "#e84545" for v in vals]
    bars = ax.barh(feat_names, vals, color=colors, edgecolor="white", height=0.65)
    ax.bar_label(bars, fmt="%.4f", padding=4, fontsize=9)
    ax.set_xlabel("Importance Score", fontsize=11)
    ax.set_title("Random Forest — Feature Importance", fontsize=13, fontweight="bold", pad=14)
    ax.set_xlim(0, max(vals) * 1.18)
    fig.tight_layout()
    out = os.path.join(FIG_DIR, "feature_importance.png")
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"      Saved -> feature_importance.png")


def _plot_confusion_matrix(cm: np.ndarray) -> None:
    plt.style.use(PLOT_STYLE)
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=["Rejected", "Approved"],
        yticklabels=["Rejected", "Approved"],
        linewidths=0.5, ax=ax,
        annot_kws={"size": 14, "weight": "bold"},
    )
    ax.set_xlabel("Predicted Label", fontsize=11)
    ax.set_ylabel("True Label", fontsize=11)
    ax.set_title("Confusion Matrix", fontsize=13, fontweight="bold", pad=14)
    fig.tight_layout()
    out = os.path.join(FIG_DIR, "confusion_matrix.png")
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"      Saved -> confusion_matrix.png")


def _plot_roc_curve(y_test: np.ndarray, y_prob: np.ndarray, roc_auc: float) -> None:
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.style.use(PLOT_STYLE)
    fig, ax = plt.subplots(figsize=(7, 6))
    ax.plot(fpr, tpr, color="#e84545", lw=2.5, label=f"ROC Curve (AUC = {roc_auc:.4f})")
    ax.plot([0, 1], [0, 1], color="#aaaaaa", lw=1.5, linestyle="--", label="Random Classifier")
    ax.fill_between(fpr, tpr, alpha=0.08, color="#e84545")
    ax.set_xlabel("False Positive Rate", fontsize=11)
    ax.set_ylabel("True Positive Rate", fontsize=11)
    ax.set_title("ROC Curve — Loan Approval Prediction", fontsize=13, fontweight="bold", pad=14)
    ax.legend(loc="lower right", fontsize=10)
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.02])
    fig.tight_layout()
    out = os.path.join(FIG_DIR, "roc_curve.png")
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"      Saved -> roc_curve.png")


# ---------------------------------------------------------------------------
# Step 6 — Save artefacts
# ---------------------------------------------------------------------------
def save_artefacts(
    model: RandomForestClassifier,
    scaler: StandardScaler,
    explainer: shap.TreeExplainer,
) -> None:
    print("[6/6] Saving artefacts ...")
    joblib.dump(model, MODEL_OUT)
    joblib.dump(scaler, SCALER_OUT)
    joblib.dump(explainer, EXPLAINER_OUT)
    print(f"      Model    saved -> rf_model.pkl")
    print(f"      Scaler   saved -> scaler.pkl")
    print(f"      Explainer saved -> shap_explainer.pkl")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    df = load_dataset(DATASET_PATH)
    df = clean_dataset(df)
    X_train, X_test, y_train, y_test, scaler = prepare_data(df)
    model = train(X_train, y_train)
    explainer = evaluate_and_plot(model, X_train, X_test, y_test)
    save_artefacts(model, scaler, explainer)
    print("\nDone. All artefacts and plots are ready.")


if __name__ == "__main__":
    main()
