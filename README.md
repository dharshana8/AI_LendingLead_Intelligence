# IDBI AI Lending Lead Intelligence Platform

AI-powered lead scoring and loan recommendation system for IDBI Bank Relationship Managers.

---

## Project Checklist

### Backend (FastAPI + MongoDB + ML)

#### Core Infrastructure
- [x] FastAPI app setup with CORS middleware (`main.py`)
- [x] MongoDB connection via Motor async driver (`database.py`)
- [x] Auto-incrementing sequence IDs for customers and users (`database.py`)
- [x] `.env` config for MONGO_URL, MONGO_DB, GROQ_API_KEY (`backend/.env`)

#### ML Pipeline
- [x] Training dataset loaded from Excel (`idbi_ai_lending_training_dataset_20000.xlsx`)
- [x] Feature engineering — income, salary regularity, EMI burden, savings ratio, credit health, intent score, repayment capacity, debt ratio (`feature_engineering.py`)
- [x] RandomForest model trained with 20,000 samples (`train_model.py`)
- [x] Model artifacts saved — `rf_model.pkl`, `scaler.pkl`, `shap_explainer.pkl`
- [x] SHAP explainability — top-3 feature contributions per customer (`predict.py`)
- [x] Model evaluation plots — `feature_importance.png`, `confusion_matrix.png`, `roc_curve.png`
- [x] Model accuracy: **95.95%** | AUC-ROC: **96%**

#### Loan Engine
- [x] AI score → Priority mapping (High ≥80, Medium ≥65, Low <65) (`loan_engine.py`)
- [x] Loan recommendation logic — Home, Mortgage, Auto, Personal (`loan_engine.py`)
- [x] Top signal detection from financial features (`loan_engine.py`)
- [x] Natural language explanation generation per customer (`loan_engine.py`)

#### API Endpoints
- [x] `POST /login` — Employee ID / Email + password auth
- [x] `POST /register` — New user registration
- [x] `GET /customers` — List all customers (with priority filter)
- [x] `POST /customers` — Add new customer (auto AI-scored)
- [x] `GET /customers/{id}` — Get single customer
- [x] `PUT /customers/{id}` — Update customer (CRM fields or re-score)
- [x] `DELETE /customers/{id}` — Delete customer
- [x] `GET /analytics` — Portfolio analytics (funnel, loan dist, AI vs CIBIL)
- [x] `GET /export` — CSV export of all leads
- [x] `POST /import-csv` — Bulk import via CSV / XLSX (with column alias mapping)
- [x] `POST /load-sample` — Seed 20 sample customers
- [x] `POST /chat` — Groq LLaMA 3.3-70B AI assistant with live portfolio context
- [x] `GET /audit-logs` — Full audit trail with search and status filter
- [x] `GET /users/{id}/settings` — Get user settings
- [x] `PUT /users/{id}/settings` — Update user settings
- [x] `GET /health` — Health check

#### Data & Seeding
- [x] 20 diverse sample customers seeded on startup (`sample_data.py`)
- [x] 3 default users seeded — RM001, BM001, ADM001 (`main.py`)
- [x] Audit log written for every create / update / delete / login action

---

### Frontend (React)

#### Auth & Navigation
- [x] Landing page with features, stats, how-it-works sections (`LandingPage.jsx`)
- [x] Login page — Sign In + Register tabs with demo credential buttons (`LoginPage.jsx`)
- [x] Role-based routing — RM / Branch Manager / Admin see different dashboards (`App.js`)
- [x] Sidebar navigation with collapse support (`Sidebar.jsx`)
- [x] App header with notifications bell and user avatar (`AppHeader.jsx`)
- [x] Skeleton loader on first login (`App.js`)
- [x] Dark mode toggle (persisted in context) (`SettingsPage.jsx`)
- [x] Toast notification system (`Toast.jsx`)

#### Dashboards
- [x] RM Dashboard — KPIs, Today's Action List, AI Insights, AI vs CIBIL chart (`DashboardPage.jsx`)
- [x] Branch Manager Dashboard — Team conversion, escalation queue, pending approvals, RM leaderboard, branch funnel (`BMDashboardPage.jsx`)
- [x] Admin Dashboard — System KPIs, AI model status banner, branch performance table, portfolio health, recent audit activity (`AdminDashboardPage.jsx`)

#### Customer Management
- [x] Customers page — table view + grid view (`CustomersPage.jsx`)
- [x] Search by name, occupation, loan, CIBIL, AI score
- [x] Filter by priority and status
- [x] Pagination (8 per page)
- [x] Bulk select → export selected to Excel or delete
- [x] Add Customer modal — 2-step form with validation and review step
- [x] Import CSV/XLSX modal with drag-and-drop
- [x] Export CSV button
- [x] Log Call modal (`LogCallModal.jsx`)
- [x] Detail Panel — full customer profile, SHAP signals, outreach message, status update, delete (`DetailPanel.jsx`)

#### Analytics
- [x] Analytics page with 7 charts — Monthly Lead Growth (bar), Loan Distribution (donut), Conversion Funnel (horizontal bar), AI Score Distribution (area), AI Model Performance (radar), Branch Performance (grouped bar), Priority Distribution (horizontal bar) (`AnalyticsPage.jsx`)
- [x] KPI cards — Total Leads, High Priority, Avg AI Score, Avg Conversion, Potential Revenue

#### AI Assistant
- [x] Chat interface with Groq LLaMA 3.3-70B (`AIAssistantPage.jsx`)
- [x] Live portfolio context injected into system prompt
- [x] Quick prompt buttons
- [x] Typing indicator
- [x] Markdown bold rendering

#### Reports
- [x] 8 report types — AI Lead, Monthly, Portfolio, Analysis, Branch, Leads, Audit, Quarterly (`ReportsPage.jsx`)
- [x] Download as CSV, Excel (xlsx), or PDF (print dialog)
- [x] Quick generate buttons

#### Follow-ups
- [x] Follow-ups page — derived from customers with `followup_date` set (`FollowUpsPage.jsx`)
- [x] Filter by status — Pending, Upcoming, Completed, Rescheduled
- [x] Today's Priority Calls strip
- [x] Mark Done, Log Call, Reschedule modal

#### Notifications
- [x] Notifications page with type filter (`NotificationsPage.jsx`)
- [x] Diff-based auto-generation — new high-priority leads and status changes trigger notifications (`AppContext.jsx`)
- [x] Mark All Read

#### Admin Pages
- [x] Admin Users page — table, create/edit/delete user, enable/disable, reset password (`AdminUsersPage.jsx`)
- [x] Admin Branches page — branch cards with stats (`AdminBranchesAuditPage.jsx`)
- [x] Admin Audit Logs page — live from backend with search and status filter (`AdminBranchesAuditPage.jsx`)

#### Profile & Settings
- [x] Profile page — user info, portfolio KPIs, edit contact details, achievements (`ProfilePage.jsx`)
- [x] Settings page — Profile, Change Password, Theme, Notifications, Language/Font Size, Accessibility (`SettingsPage.jsx`)

#### Shared Components
- [x] `DetailPanel.jsx` — slide-in customer detail with SHAP signals, outreach, status update
- [x] `AIvsCIBIL.jsx` — AI vs CIBIL comparison chart
- [x] `KPICards.jsx`, `InsightsCard.jsx`, `FilterBar.jsx`, `LeadTable.jsx`
- [x] `Badges.jsx` — Priority and Loan badges
- [x] `ProgressBar.jsx`, `SignalBars.jsx`
- [x] `LogCallModal.jsx` — log call outcome + set follow-up date/time
- [x] `AppContext.jsx` — global state, API calls, notification generation

---

### Pending / Not Yet Done

- [ ] JWT authentication — backend currently returns user object without a real JWT token; `Authorization: Bearer` header is sent but not validated server-side
- [ ] `PUT /users/{employeeId}` endpoint — Admin Users page calls this to update user details but the endpoint does not exist yet
- [ ] `POST /users/{employeeId}/reset-password` endpoint — Reset Password button in Admin Users page calls this but endpoint does not exist
- [ ] Branch management backend integration — Add Branch / Edit Branch / View Details buttons show info toasts; no backend endpoints exist
- [ ] Password change backend validation — Settings → Change Password calls `PUT /users/{id}/settings` with password field; backend `UserSettingsRequest` schema does not include a `password` field, so it falls back to local save
- [ ] Real-time notifications (WebSocket / SSE) — currently polling on page load only
- [ ] Unit tests — no test files written for backend or frontend logic

---

## How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally on port 27017 (or set `MONGO_URL` in `.env`)

### Backend

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Train the ML model (only needed once)
python train_model.py

# 3. Copy and fill in environment variables
copy .env.example .env
# Set GROQ_API_KEY in .env for AI Assistant

# 4. Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

App runs at: http://localhost:3000

---

## Demo Credentials

| Employee ID | Password     | Role                |
|-------------|--------------|---------------------|
| RM001       | password123  | Relationship Manager |
| BM001       | password123  | Branch Manager       |
| ADM001      | admin123     | Administrator        |

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | FastAPI, Motor (async MongoDB), Pydantic v2     |
| ML        | scikit-learn RandomForest, SHAP, StandardScaler |
| AI Chat   | Groq API — LLaMA 3.3-70B                        |
| Database  | MongoDB                                         |
| Frontend  | React 19, Recharts, Axios, xlsx                 |
| Styling   | Inline CSS with IBM Plex Sans / Mono / Fraunces |

---

## Model Performance

| Metric    | Score  |
|-----------|--------|
| Accuracy  | 95.95% |
| Precision | 91%    |
| Recall    | 88%    |
| F1 Score  | 89%    |
| AUC-ROC   | 96%    |

Trained on 20,000 IDBI lending records with 11 financial features.
