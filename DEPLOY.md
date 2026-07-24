# Deploy Guide — IDBI AI Lending Lead Intelligence

Full stack deploy: MongoDB Atlas + Railway (backend) + Vercel (frontend)
Estimated time: 30–40 minutes

---

## Prerequisites

- GitHub account (already has the repo)
- Node.js 18+ installed
- Python 3.11+ installed

---

## STEP 1 — MongoDB Atlas (Free Cloud Database)

1. Go to https://mongodb.com/atlas → Sign up free
2. Create a project → name it `idbi-lending`
3. Create a cluster → choose **M0 Free Tier** → region: Mumbai (ap-south-1)
4. **Database Access** → Add Database User
   - Username: choose any username (e.g. `dbadmin`)
   - Password: generate a strong one → **copy it**
   - Role: Atlas Admin
5. **Network Access** → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
6. **Connect** → Drivers → copy the connection string
   - Looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
   - Replace `<username>` and `<password>` with your actual values
   - Add database name at end: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/idbi_lending`
   - **Save this URL — needed in Step 2**

---

## STEP 2 — Train the ML Model (do this once locally)

```bash
cd backend
pip install -r requirements.txt
python train_model.py
```

This creates `rf_model.pkl`, `scaler.pkl`, `shap_explainer.pkl`
These files are NOT in git (gitignored) — must be generated locally before deploy.

---

## STEP 3 — Backend on Railway

1. Go to https://railway.app → Login with GitHub
2. **New Project** → Deploy from GitHub repo
3. Select `AI_LendingLead_Intelligence` repo
4. Railway will detect the repo — set **Root Directory** to `backend`
5. **Variables** tab → Add these environment variables:

```
MONGO_URL       = mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/idbi_lending
MONGO_DB        = idbi_lending
GROQ_API_KEY    = (get from https://console.groq.com — free account)
JWT_SECRET      = idbi-lending-super-secret-key-2025-change-this
JWT_EXPIRE_MINUTES = 60
```

6. **Settings** tab → Start Command:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

7. Deploy → wait 2-3 minutes
8. Railway gives a URL like `https://ai-lending-backend.up.railway.app`
9. **Test it**: open `https://your-railway-url.up.railway.app/health` → should return `{"status":"OK"}`
10. **Save this URL — needed in Step 4**

### Important: Upload ML model files to Railway

Since `.pkl` files are gitignored, upload them via Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Upload model files
railway up --service backend
```

OR — simpler option: add these lines to `train_model.py` and let Railway run it on startup by changing start command to:
```
python train_model.py && uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## STEP 4 — Frontend on Vercel

1. Go to https://vercel.com → Login with GitHub
2. **New Project** → Import `AI_LendingLead_Intelligence` repo
3. **Root Directory** → set to `frontend`
4. **Environment Variables** → Add:
```
REACT_APP_API_URL = https://your-railway-url.up.railway.app
```
5. **Build Command**: `npm run build`
6. **Output Directory**: `build`
7. Deploy → wait 2-3 minutes
8. Vercel gives URL like `https://ai-lending.vercel.app`

---

## STEP 5 — Update CORS on Backend

After getting Vercel URL, update Railway environment variable:

```
FRONTEND_URL = https://ai-lending.vercel.app
```

And update `backend/main.py` CORS section:
```python
allow_origins=[
    "http://localhost:3000",
    "https://ai-lending.vercel.app",  # your actual Vercel URL
],
```

Commit + push → Railway auto-redeploys.

---

## STEP 6 — Seed Initial Data

After both are deployed, open the app → login as ADM001 / admin123
→ Customers page → Load Sample Data button
→ This seeds 20 sample customers automatically

Or import your CSV file directly from the UI.

---

## Demo Credentials

| Employee ID | Password     | Role             |
|-------------|--------------|------------------|
| RM001       | password123  | Relationship Manager |
| BM001       | password123  | Branch Manager   |
| ADM001      | admin123     | Administrator    |

---

## Troubleshooting

**Backend not starting?**
- Check Railway logs → Variables tab → make sure MONGO_URL is correct
- Make sure `train_model.py` ran and `.pkl` files exist

**Frontend shows "Cannot reach server"?**
- Check `REACT_APP_API_URL` in Vercel env variables
- Make sure it does NOT have a trailing slash
- Redeploy after changing env variables

**Login not working?**
- Open browser console → check network tab → see what URL it's hitting
- Should be hitting your Railway URL, not localhost

**CORS error in browser?**
- Update `allow_origins` in `main.py` with your Vercel URL
- Commit + push → Railway redeploys automatically

---

## Architecture

```
User Browser
     │
     ▼
Vercel (React Frontend)
     │  API calls
     ▼
Railway (FastAPI Backend)
     │
     ├── MongoDB Atlas (customer data, users, audit logs)
     └── Groq API (AI assistant — LLaMA 3.3-70B)
```

---

## After Deploy — share this with the team

- Frontend URL: https://_____________.vercel.app
- Backend API docs: https://_____________.up.railway.app/docs
- GitHub repo: https://github.com/dharshana8/AI_LendingLead_Intelligence
