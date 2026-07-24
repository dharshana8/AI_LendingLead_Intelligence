import axios from "axios";

const BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem("nova_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Normalizer: maps any backend shape → UI field names ──────────────────────
export function normalizeCustomer(c) {
  if (!c) return null;

  const LOAN_ICON = {
    "Home Loan": "🏠",
    "Personal Loan": "👤",
    "Auto Loan": "🚗",
    "Mortgage Loan": "🏢",
  };

  const loan = c.recommended_loan || c.loan || "Personal Loan";
  const aiScore = Math.round(c.ai_score ?? c.aiScore ?? c.ai_lead_score ?? 0);

  // conversion_probability may be 0-1 or 0-100
  const rawConv = c.conversion_probability ?? c.conversion ?? 0;
  const conversion = Math.round(rawConv <= 1 ? rawConv * 100 : rawConv);

  // Signals — read directly from top-level backend fields (feature_engineering.py output)
  const toPercent = (v) => {
    if (v === undefined || v === null) return 0;
    const n = parseFloat(v);
    return Math.min(100, Math.round(n <= 1 ? n * 100 : n));
  };

  // Repayment capacity: normalize against ₹1,00,000 max for bar width
  const repaymentCapacityRaw = c.repayment_capacity ?? 0;
  const repaymentCapacityPct = Math.min(100, Math.round((repaymentCapacityRaw / 100000) * 100));

  // CIBIL contribution: (cibil_score - 300) / 600 — not in feature_engineering.py,
  // computed here from raw cibil_score. If backend adds a shap-weighted version later, swap this.
  const cibilScore = c.cibil_score ?? c.cibil ?? 0;
  const cibilContributionPct = Math.min(100, Math.round(Math.max(0, (cibilScore - 300) / 600) * 100));

  const signals = {
    salaryStability:   toPercent(c.salary_regularity),
    repaymentCapacity: repaymentCapacityPct,
    savingsRatio:      toPercent(c.savings_ratio),
    loanIntent:        toPercent(c.intent_score),
    creditHealth:      toPercent(c.credit_health),
    cibilContribution: cibilContributionPct,
  };

  const priority = c.priority || derivePriority(aiScore);
  // Prefer SHAP top feature (most impactful by absolute value) over heuristic
  const shapTop = Array.isArray(c.shap_top3) && c.shap_top3.length > 0 ? c.shap_top3[0] : null;
  const topSignal = c.top_signal || c.signal || (shapTop ? shapFeatureLabel(shapTop.feature) : deriveTopSignal(signals));
  const name = c.name || c.customer_name || "Unknown";
  const income = c.monthly_income ?? c.income ?? 0;

  return {
    id:          c.id ?? c.customer_id,
    name,
    occupation:  c.occupation || c.job_title || "Professional",
    income,
    cibil:       c.cibil_score ?? c.cibil ?? 0,
    aiScore,
    conversion,
    loan,
    loanIcon:    LOAN_ICON[loan] || "👤",
    priority,
    signal:      topSignal,
    signals,
    status:      c.status || "New",
    lastContact: c.last_contact || (c.created_at ? c.created_at.split("T")[0] : "—"),
    assignedTo:  c.assigned_to || "Unassigned",
    branch:      c.branch || "",
    outreach:    c.outreach_message || buildOutreach(name, loan, income),
    alsoEligible:     Array.isArray(c.also_eligible) ? c.also_eligible : [],
    collateralOption: c.collateral_option ?? null,
    _raw:        c,
  };
}

function derivePriority(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

const SHAP_FEATURE_LABELS = {
  Age:                 "Customer Age",
  Monthly_Income:      "Monthly Income",
  CIBIL_Score:         "CIBIL Score",
  EMI_Burden:          "EMI Burden",
  Savings_Ratio:       "Savings Ratio",
  Credit_Health:       "Credit Health",
  Repayment_Capacity:  "Repayment Capacity",
  Debt_Ratio:          "Debt Ratio",
  Existing_Loan_Count: "Existing Loans",
  Years_of_Experience: "Work Experience",
  Account_Balance:     "Account Balance",
};

function shapFeatureLabel(feature) {
  return SHAP_FEATURE_LABELS[feature] || feature.replace(/_/g, " ");
}

function deriveTopSignal(signals) {
  const labelMap = {
    salaryStability: "Salary Stability",
    repaymentCapacity: "Repayment Capacity",
    savingsRatio: "Savings Rate",
    loanIntent: "Loan Intent",
    creditHealth: "Credit Health",
    cibilContribution: "CIBIL Contribution",
  };
  const top = Object.entries(signals).reduce((a, b) => (b[1] > a[1] ? b : a), ["salaryStability", 0]);
  return labelMap[top[0]] || "Salary Stability";
}

function buildOutreach(name, loan, income) {
  const amt = Math.round((income * 48) / 100000) * 100000;
  return `Hi ${name},\n\nBased on your strong repayment capacity and healthy financial profile, you are eligible for a ${loan} up to ₹${amt.toLocaleString("en-IN")}.\n\nContact your Relationship Manager to discuss further.`;
}

// ── Analytics normalizer ─────────────────────────────────────────────────────
export function normalizeAnalytics(data, customers) {
  if (!data && !customers) return null;

  const custs = customers || [];
  const total = data?.total_leads ?? data?.total_customers ?? custs.length;
  const highCount = data?.high_priority ?? data?.high_priority_count ?? custs.filter(c => c.priority === "High").length;
  const avgScore = data?.average_ai_score ?? data?.avg_ai_score ?? (custs.length ? Math.round(custs.reduce((s, c) => s + c.aiScore, 0) / custs.length) : 0);
  const rawConvProb = data?.average_conversion_probability ?? data?.avg_conversion;
  const avgConv = rawConvProb != null
    ? Math.round(rawConvProb <= 1 ? rawConvProb * 100 : rawConvProb)
    : (custs.length ? Math.round(custs.reduce((s, c) => s + c.conversion, 0) / custs.length) : 0);

  // loan distribution — DS colors
  const loanCounts = data?.loan_distribution || custs.reduce((acc, c) => {
    acc[c.loan] = (acc[c.loan] || 0) + 1;
    return acc;
  }, {});
  const loanTotal = Object.values(loanCounts).reduce((s, v) => s + v, 0) || 1;
  const loanDist = [
    { loan: "Home Loan",     color: "#0E1A2B", count: loanCounts["Home Loan"]     || 0, pct: Math.round(((loanCounts["Home Loan"]     || 0) / loanTotal) * 100) },
    { loan: "Personal Loan", color: "#C79A3D", count: loanCounts["Personal Loan"] || 0, pct: Math.round(((loanCounts["Personal Loan"] || 0) / loanTotal) * 100) },
    { loan: "Mortgage Loan", color: "#2F6E63", count: loanCounts["Mortgage Loan"] || 0, pct: Math.round(((loanCounts["Mortgage Loan"] || 0) / loanTotal) * 100) },
    { loan: "Auto Loan",     color: "#B5482F", count: loanCounts["Auto Loan"]     || 0, pct: Math.round(((loanCounts["Auto Loan"]     || 0) / loanTotal) * 100) },
  ];

  // funnel — use real backend data if present, else estimate
  const funnel = data?.funnel?.length
    ? data.funnel
    : [
    { stage: "Total Leads",  count: total,                    color: "#0E1A2B" },
    { stage: "AI Qualified", count: Math.round(total * 0.70), color: "#C79A3D" },
    { stage: "Contacted",    count: Math.round(total * 0.55), color: "#2F6E63" },
    { stage: "Interested",   count: Math.round(total * 0.40), color: "#2F6E63" },
    { stage: "Applied",      count: Math.round(total * 0.25), color: "#C79A3D" },
    { stage: "Converted",    count: Math.round(total * 0.15), color: "#2F6E63" },
  ];

  // monthly
  const monthly = data?.monthly_data || data?.monthly || [
    { month: "Jan", leads: 12, converted: 4 },
    { month: "Feb", leads: 15, converted: 5 },
    { month: "Mar", leads: 18, converted: 7 },
    { month: "Apr", leads: 14, converted: 6 },
    { month: "May", leads: 20, converted: 8 },
    { month: "Jun", leads: total, converted: Math.round(total * 0.15) },
  ];

  // branches
  const branches = data?.branch_performance || data?.branches || [
    { name: "Mumbai Main",   leads: Math.round(total * 0.40), conversion: 42, revenue: "₹1.8Cr", rank: 1 },
    { name: "Delhi Central", leads: Math.round(total * 0.30), conversion: 38, revenue: "₹1.4Cr", rank: 2 },
    { name: "Bangalore Tech",leads: Math.round(total * 0.20), conversion: 35, revenue: "₹0.9Cr", rank: 3 },
    { name: "Chennai South", leads: Math.round(total * 0.10), conversion: 28, revenue: "₹0.7Cr", rank: 4 },
  ];

  // ai model metrics — DS colors
  const aiMetrics = data?.model_metrics || data?.ai_metrics || [
    { label: "Overall Accuracy", value: data?.model_accuracy ? Math.round(data.model_accuracy * 100) : 94, color: "#2F6E63" },
    { label: "Precision",        value: 91, color: "#C79A3D" },
    { label: "Recall",           value: 88, color: "#C79A3D" },
    { label: "F1 Score",         value: 89, color: "#2F6E63" },
    { label: "AUC-ROC",          value: 96, color: "#C79A3D" },
  ];

  // priority dist
  const medCount = data?.medium_priority ?? data?.medium_priority_count ?? custs.filter(c => c.priority === "Medium").length;
  const lowCount  = data?.low_priority  ?? data?.low_priority_count  ?? custs.filter(c => c.priority === "Low").length;

  // potential revenue
  const rawRevenue = data?.potential_business_value ?? data?.potential_revenue;
  const potentialRevenue = rawRevenue
    ? `₹${(rawRevenue / 10000000).toFixed(1)}Cr`
    : `₹${((custs.reduce((s, c) => s + c.income, 0) * 48) / 10000000).toFixed(1)}Cr`;

  // cibil comparison
  const cibilQualified = data?.ai_vs_cibil?.cibil_qualified ?? data?.cibil_qualified ?? Math.round(total * 0.45);
  const aiQualified    = data?.ai_vs_cibil?.ai_qualified    ?? data?.ai_qualified    ?? Math.round(total * 0.65);
  const missedByCibil  = data?.ai_vs_cibil ? (aiQualified - cibilQualified) : (data?.missed_by_cibil ?? (aiQualified - cibilQualified));

  // insights
  const insights = data?.insights || [
    `AI identified ${highCount} high-intent customers ready for immediate outreach`,
    `Home Loan demand is highest — ${loanDist[0].count} out of ${total} leads prefer Home Loans`,
    `Expected conversion increased from 15% to ${avgConv}% using AI scoring`,
    `AI discovered ${missedByCibil} customers missed by traditional CIBIL screening`,
    `Potential business value of ${potentialRevenue} identified this week`,
  ];

  return {
    total, highCount, medCount, lowCount,
    avgScore, avgConv, potentialRevenue,
    loanDist, funnel, monthly, branches, aiMetrics,
    cibilQualified, aiQualified, missedByCibil,
    insights,
  };
}

// ── API calls ────────────────────────────────────────────────────────────────
export const apiLogin = (employeeId, password) =>
  api.post("/login", { employeeId, password }).then(r => r.data);

export const apiRegister = (payload) =>
  api.post("/register", payload).then(r => r.data);

export const apiGetCustomers = () =>
  api.get("/customers").then(r => {
    const list = Array.isArray(r.data) ? r.data : (r.data.customers ?? r.data.data ?? []);
    return list.map(normalizeCustomer);
  });

export const apiGetCustomer = (id) =>
  api.get(`/customers/${id}`).then(r => normalizeCustomer(r.data));

export const apiCreateCustomer = (payload) =>
  api.post("/customers", payload).then(r => normalizeCustomer(r.data));

export const apiUpdateCustomer = (id, payload) =>
  api.put(`/customers/${id}`, payload).then(r => normalizeCustomer(r.data));

export const apiDeleteCustomer = (id) =>
  api.delete(`/customers/${id}`).then(r => r.data);

export const apiDeleteAllCustomers = () =>
  api.delete("/customers").then(r => r.data);

export const apiGetAnalytics = () =>
  api.get("/analytics").then(r => r.data);

export const apiGetHealth = () =>
  api.get("/health").then(r => r.data);

export const apiLoadSample = () =>
  api.post("/load-sample").then(r => r.data);

export const apiRescoreAll = () =>
  api.post("/rescore-all").then(r => r.data);

export const apiImportCSV = (file) => {
  const form = new FormData();
  form.append("file", file);
  const token = localStorage.getItem("nova_token");
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  return fetch(`${BASE}/import-csv`, { method: "POST", body: form, headers })
    .then(r => { if (!r.ok) return r.json().then(e => Promise.reject(e)); return r.json(); });
};

export const apiExport = () =>
  api.get("/export", { responseType: "blob" }).then(r => r.data);

export const apiChat = (message, history = []) =>
  api.post("/chat", { message, history }).then(r => r.data);

export const apiGetAuditLogs = (params = {}) =>
  api.get("/audit-logs", { params }).then(r => r.data);

export const apiGetUserSettings = (employeeId) =>
  api.get(`/users/${employeeId}/settings`).then(r => r.data);

export const apiUpdateUserSettings = (employeeId, payload) =>
  api.put(`/users/${employeeId}/settings`, payload).then(r => r.data);

export default api;
