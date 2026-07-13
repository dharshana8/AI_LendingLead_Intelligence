# IDBI Bank — AI Lending Lead Intelligence · Backend

FastAPI + MongoDB backend powering AI-driven lead scoring, loan recommendation, and explainability for IDBI Bank's Lending Intelligence Platform.

---

## How to Run Locally

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env           # add your MONGO_URL and GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs  
- MongoDB must be running locally **or** set `MONGO_URL` to a MongoDB Atlas URI in `.env`
- On first startup, 20 sample customers are auto-seeded if the `leads` collection is empty

---

## Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB=idbi_lending
GROQ_API_KEY=your_groq_api_key_here
```

---

## Architecture

```
React Frontend
      │
      ▼
FastAPI  (main.py)
      │
      ├── feature_engineering.py  → Derives income, EMI burden, savings ratio, etc.
      ├── ml_model.py             → RandomForest trained on 20,000 row dataset
      ├── loan_engine.py          → Priority, loan recommendation, explainability
      ├── crud.py                 → DB read/write with auto-enrichment on every save
      ├── analytics.py            → Aggregated portfolio metrics
      └── database.py             → MongoDB via Motor (async driver)
```

---

## API Reference

| Method | Endpoint            | Description                                              |
|--------|---------------------|----------------------------------------------------------|
| GET    | /health             | Health check                                             |
| POST   | /login              | Employee login                                           |
| POST   | /register           | Register new employee                                    |
| POST   | /customers          | Add customer — auto scores + recommends loan             |
| GET    | /customers          | List all customers (filter: `?priority=High`)            |
| GET    | /customers/{id}     | Get single customer                                      |
| PUT    | /customers/{id}     | Update customer — re-scores automatically                |
| DELETE | /customers/{id}     | Delete customer                                          |
| POST   | /load-sample        | Seed sample data (skip if exists; `?force=true` to reset)|
| GET    | /analytics          | Portfolio analytics for dashboard                        |
| GET    | /export             | Download all leads as CSV                                |
| POST   | /chat               | Groq-powered AI assistant with live portfolio context    |

---

## Feature Engineering

| Feature            | Formula                                        |
|--------------------|------------------------------------------------|
| Income             | Median of non-zero monthly salary credits      |
| Salary Regularity  | 1 − (std / mean) of salary credits (0–1)       |
| EMI Burden         | EMI Debits / Income                            |
| Savings Ratio      | (Income − EMI) / Income                        |
| Credit Health      | 1 − (CC Spend / Credit Limit)                  |
| Intent Score       | min(loan_page_visits / 10, 1.0)                |
| Repayment Capacity | Income − EMI Debits                            |
| Debt Ratio         | (EMI + CC Spend) / Income                      |

---

## ML Pipeline

- Algorithm: `RandomForestClassifier` (sklearn Pipeline with StandardScaler)
- Training data: `idbi_ai_lending_training_dataset_20000.xlsx` (20,000 rows)
- Artifacts saved: `rf_model.pkl`, `scaler.pkl`, `shap_explainer.pkl`
- Output: `conversion_probability` (0–1) → `ai_score` (0–100)
- SHAP values used for top-3 feature explainability per customer

---

## Priority & Loan Logic

**Priority**

| AI Score | Priority |
|----------|----------|
| ≥ 80     | High     |
| 65–79    | Medium   |
| < 65     | Low      |

**Loan Recommendation**

| Condition                                           | Loan Type     |
|-----------------------------------------------------|---------------|
| Income ≥ ₹80K & Repayment Capacity ≥ ₹50K          | Home Loan     |
| Income ≥ ₹60K & Repayment ≥ ₹30K & AI Score ≥ 65  | Mortgage Loan |
| Intent Score ≥ 0.6 & Repayment ≥ ₹15K             | Auto Loan     |
| Default                                             | Personal Loan |

---

## Database

- Engine: MongoDB (`idbi_lending` database)
- Driver: Motor (async) + PyMongo
- Collections:
  - `leads` — customer inputs, derived features, ML predictions, CRM fields
  - `users` — employee accounts (RM, Branch Manager, Admin) — auto-seeded on startup
  - `counters` — auto-increment sequences for `customer_id` and `user_id`

---

## Deployment (Render.com)

1. Push repo to GitHub
2. Create a **Web Service** on Render pointing to the `backend/` folder
3. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
4. Add environment variables from `.env.example`
5. Deploy

---

## Default Login Credentials

| Role             | Employee ID | Password    |
|------------------|-------------|-------------|
| Relationship Mgr | RM001       | password123 |
| Branch Manager   | BM001       | password123 |
| Administrator    | ADM001      | admin123    |
