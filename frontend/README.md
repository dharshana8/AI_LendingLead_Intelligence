# IDBI Bank — AI Lending Lead Intelligence · Frontend

React dashboard for IDBI Bank's AI-powered Lending Lead Intelligence Platform. Helps Relationship Managers identify, score, and convert high-value loan leads using real-time ML predictions.

---

## How to Run Locally

```bash
cd frontend
npm install
npm start
```

- App runs at: http://localhost:3000  
- Backend must be running at: http://localhost:8000  
- See `backend/README.md` to start the backend

---

## Pages

| Page              | Route         | Description                                              |
|-------------------|---------------|----------------------------------------------------------|
| Login             | /login        | Employee sign-in and registration                        |
| Dashboard         | /dashboard    | KPI cards, lead table, AI vs CIBIL comparison            |
| Lead Intelligence | /leads        | Full lead list with priority filters                     |
| Customers         | /customers    | Customer management — add, view, filter, export          |
| Analytics         | /analytics    | Portfolio charts, funnel, loan distribution              |
| AI Assistant      | /ai-assistant | Groq-powered chat with live portfolio context            |
| Follow-ups        | /followups    | Scheduled follow-up tracker                              |
| Reports           | /reports      | Exportable reports                                       |
| Profile           | /profile      | Employee profile                                         |
| Settings          | /settings     | App preferences                                          |
| Admin — Users     | /admin-users  | User management (Admin only)                             |
| Admin — Branches  | /admin-branches | Branch performance (Admin only)                        |

---

## Key Features

- **AI Lead Scoring** — Every customer gets an AI Score (0–100) and conversion probability from the ML backend
- **Add Customer Modal** — 2-step form (fill → review) that saves directly to MongoDB via the backend API
- **Priority Filtering** — High / Medium / Low priority leads with real-time filter
- **Detail Panel** — Slide-in panel with signal analysis, SHAP explainability, outreach message, and full customer record
- **Dark Mode** — Full dark/light theme toggle across all pages
- **CSV Export** — One-click export of all leads
- **Role-Based UI** — Different sidebar menus for RM, Branch Manager, and Admin
- **AI Assistant** — Chat with Groq LLaMA3 using live portfolio data as context

---

## Tech Stack

- React 18 (Create React App)
- Axios for API calls
- Inline styles (no CSS framework — matches IDBI design system)
- Context API for global state (customers, analytics, auth, dark mode)

---

## Project Structure

```
frontend/src/
├── components/
│   ├── DetailPanel.jsx      # Slide-in customer detail drawer
│   ├── Sidebar.jsx          # Role-based navigation
│   ├── KPICards.jsx         # Dashboard metric cards
│   ├── LeadTable.jsx        # Lead list table
│   ├── Badges.jsx           # Priority & loan type badges
│   ├── SignalBars.jsx       # SHAP signal visualization
│   ├── InsightsCard.jsx     # AI insights summary
│   ├── AIvsCIBIL.jsx        # AI vs CIBIL comparison chart
│   └── FilterBar.jsx        # Search and filter controls
├── context/
│   └── AppContext.jsx       # Global state — customers, auth, dark mode
├── pages/
│   ├── DashboardPage.jsx
│   ├── CustomersPage.jsx    # Customer management + Add Customer modal
│   ├── AnalyticsPage.jsx
│   ├── AIAssistantPage.jsx
│   └── ...
└── services/
    ├── api.js               # All API calls + normalizeCustomer mapper
    └── useCustomers.js      # Customer data hook
```

---

## Build for Production

```bash
npm run build
```

Output goes to `frontend/build/` — ready to serve as a static site.

---

## Deployment (Netlify / Vercel)

1. Push repo to GitHub
2. Connect `frontend/` folder to Netlify or Vercel
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variable if needed: `REACT_APP_API_URL=https://your-backend.onrender.com`

> Update `BASE` in `src/services/api.js` to point to your deployed backend URL before building.

---

## Default Login Credentials

| Role             | Employee ID | Password    |
|------------------|-------------|-------------|
| Relationship Mgr | RM001       | password123 |
| Branch Manager   | BM001       | password123 |
| Administrator    | ADM001      | admin123    |
