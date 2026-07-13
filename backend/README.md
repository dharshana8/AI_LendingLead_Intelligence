# AI Lending Lead Intelligence — Backend

IDBI Bank Hackathon | AI-powered lead scoring, loan recommendation, and explainability engine.

---

## Problem Statement

Banks struggle to identify high-intent, creditworthy loan applicants from raw transaction data.
This platform uses ML to score leads, recommend the right loan product, and explain the decision — replacing manual CIBIL-only filtering.

---

## Architecture

```
React Frontend
      │
      ▼
FastAPI (main.py)
      │
      ├── feature_engineering.py  → Derives income, EMI burden, savings ratio, etc.
      ├── ml_model.py             → RandomForest trained on 500 synthetic customers
      ├── loan_engine.py          → Priority, loan recommendation, explainability
      ├── crud.py                 → DB read/write with auto-enrichment
      ├── analytics.py            → Aggregated business metrics
      └── database.py / models.py → SQLite via SQLAlchemy ORM
```

---

## Feature Engineering

| Feature            | Formula                                      |
|--------------------|----------------------------------------------|
| Income             | Median of non-zero monthly salary credits    |
| Salary Regularity  | 1 − (std / mean) of salary credits (0–1)     |
| EMI Burden         | EMI / Income                                 |
| Savings Ratio      | (Income − EMI) / Income                      |
| Credit Health      | 1 − (CC Spend / Credit Limit)                |
| Intent Score       | min(loan_page_visits / 10, 1.0)              |
| Repayment Capacity | Income − EMI                                 |

---

## ML Pipeline

- Algorithm: `RandomForestClassifier` (100 trees, sklearn Pipeline with StandardScaler)
- Training: 500 synthetic customers generated on first startup
- Model saved to: `rf_model.pkl` (reloaded on subsequent starts)
- Output: `conversion_probability` (0–1) → `ai_score` (0–100)

---

## Database

- Engine: SQLite (`leads.db`)
- ORM: SQLAlchemy 2.0
- Table: `leads` — stores raw inputs, derived features, and ML predictions

---

## API Reference

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /health               | Health check                         |
| POST   | /customers            | Create customer + auto-score         |
| GET    | /customers            | List all (filter: ?priority=High)    |
| GET    | /customers/{id}       | Get single customer                  |
| PUT    | /customers/{id}       | Update + re-score                    |
| DELETE | /customers/{id}       | Delete customer                      |
| POST   | /load-sample          | Load 20 realistic Indian customers   |
| GET    | /analytics            | Business analytics dashboard data    |

---

## How to Run Locally

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Deployment on Render.com

1. Push the `backend/` folder to a GitHub repository.
2. Create a new **Web Service** on Render.
3. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -m uvicorn main:app --host 0.0.0.0 --port 10000`
4. Add environment variables from `.env.example`.
5. Deploy.

---

## Priority Logic

| AI Score | Priority |
|----------|----------|
| ≥ 80     | High     |
| 65–79    | Medium   |
| < 65     | Low      |

---

## Loan Recommendation Logic

| Condition                                      | Loan Type       |
|------------------------------------------------|-----------------|
| Income ≥ ₹80K & Repayment Capacity ≥ ₹50K     | Home Loan       |
| Income ≥ ₹60K & Repayment ≥ ₹30K & Score ≥ 65| Mortgage Loan   |
| Intent ≥ 0.6 & Repayment ≥ ₹15K               | Auto Loan       |
| Default                                        | Personal Loan   |

---

## Future Scope

- Replace synthetic training data with real anonymized bank data
- Add JWT authentication for API security
- Integrate with CRM systems (Salesforce, Zoho)
- Add real-time lead alerts via WebSocket
- Build model retraining pipeline with feedback loop
- Add PostgreSQL support for production scale
