import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.responses import StreamingResponse

from database import leads_col, audit_col, get_next_sequence_value
from schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from crud import create_lead, get_leads, get_lead, delete_lead, update_lead
from auth import get_current_user, require_bm_or_admin
from sample_data import SAMPLE_CUSTOMERS

router = APIRouter(tags=["Customers"])


async def _write_audit(user: str, action: str, target: str, status: str = "Success", ip: str = "—"):
    await audit_col.insert_one({
        "user": user, "action": action, "target": target,
        "status": status, "ip": ip, "timestamp": datetime.utcnow(),
    })


# ── CRUD ──────────────────────────────────────────────────────────────────────

@router.post("/customers", response_model=CustomerResponse, status_code=201)
async def create_customer(
    payload: CustomerCreate,
    caller: dict = Depends(get_current_user),
):
    # Auto-assign to caller if not explicitly set
    raw = payload.model_dump()
    if not raw.get("assigned_to"):
        raw["assigned_to"] = caller["sub"]
    if not raw.get("branch"):
        raw["branch"] = caller.get("branch", "")
    result = await create_lead(CustomerCreate(**raw))
    await _write_audit(caller["sub"], "Created Customer", payload.name)
    return result


@router.get("/customers", response_model=list[CustomerResponse])
async def list_customers(
    priority: str | None = Query(default=None, pattern="^(High|Medium|Low)$"),
    caller: dict = Depends(get_current_user),
):
    role = caller.get("role")
    if role == "rm":
        # RM sees their own assigned leads + unassigned leads in their branch
        return await get_leads(priority=priority, assigned_to=caller["sub"], include_unassigned=True)
    elif role == "bm":
        # BM sees only their branch — ignore any client-supplied branch param
        return await get_leads(priority=priority, branch=caller.get("branch"))
    else:
        # Admin sees everything
        return await get_leads(priority=priority)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, caller: dict = Depends(get_current_user)):
    lead = await get_lead(customer_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Customer not found.")
    _assert_lead_access(caller, lead)
    return lead


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    caller: dict = Depends(get_current_user),
):
    lead = await get_lead(customer_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Customer not found.")
    _assert_lead_access(caller, lead)

    # Status transition guard: only BM/Admin may move to Converted or Declined
    new_status = payload.model_dump(exclude_none=True).get("status")
    if new_status in ("Converted", "Declined") and caller.get("role") not in ("bm", "admin"):
        raise HTTPException(status_code=403, detail="Only Branch Manager or Admin may approve/decline applications")

    updated = await update_lead(customer_id, payload)
    updates = payload.model_dump(exclude_none=True)
    action = "Logged Call" if "call_outcome" in updates else "Updated Customer"
    await _write_audit(caller["sub"], action, lead.get("name", str(customer_id)))
    return updated


@router.delete("/customers", status_code=204)
async def delete_all_customers(caller: dict = Depends(require_bm_or_admin)):
    count = await leads_col.count_documents({})
    await leads_col.delete_many({})
    await _write_audit(caller["sub"], "Deleted All Customers", f"{count} records wiped")


@router.delete("/customers/{customer_id}", status_code=204)
async def remove_customer(customer_id: int, caller: dict = Depends(get_current_user)):
    lead = await get_lead(customer_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Customer not found.")
    _assert_lead_access(caller, lead)
    await delete_lead(customer_id)
    await _write_audit(caller["sub"], "Deleted Customer", lead.get("name", str(customer_id)))


# ── Export ────────────────────────────────────────────────────────────────────

@router.get("/export")
async def export_csv(caller: dict = Depends(get_current_user)):
    role = caller.get("role")
    if role == "rm":
        leads = await get_leads(assigned_to=caller["sub"], include_unassigned=True)
    elif role == "bm":
        leads = await get_leads(branch=caller.get("branch"))
    else:
        leads = await get_leads()

    output = io.StringIO()
    fields = [
        "customer_id", "name", "age", "occupation", "cibil_score",
        "monthly_credit_1", "monthly_credit_2", "monthly_credit_3",
        "monthly_credit_4", "monthly_credit_5", "monthly_credit_6",
        "emi_debits", "cc_spend", "credit_limit", "account_balance",
        "existing_loan_count", "years_of_experience", "loan_page_visits",
        "income", "salary_regularity", "emi_burden", "savings_ratio",
        "ai_score", "conversion_probability", "priority", "recommended_loan",
        "top_signal", "status", "assigned_to", "branch", "last_contact", "created_at",
    ]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for lead in leads:
        writer.writerow({f: lead.get(f, "") for f in fields})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"},
    )


# ── Load sample ───────────────────────────────────────────────────────────────

@router.post("/load-sample", response_model=list[CustomerResponse])
async def load_sample(
    force: bool = Query(default=False),
    caller: dict = Depends(require_bm_or_admin),
):
    if not force and await leads_col.count_documents({}) > 0:
        return await get_leads()
    if force:
        await leads_col.delete_many({})
    results = []
    for customer in SAMPLE_CUSTOMERS:
        res = await create_lead(CustomerCreate(**customer))
        results.append(res)
    return results


@router.post("/rescore-all", status_code=200)
async def rescore_all(caller: dict = Depends(require_bm_or_admin)):
    """Re-run ML scoring on every existing customer document.
    Stamps model_version and scored_at on all records that are missing them.
    """
    from crud import _enrich
    cursor = leads_col.find({})
    leads = await cursor.to_list(length=None)
    updated = 0
    for lead in leads:
        enriched = _enrich(lead)
        await leads_col.update_one(
            {"customer_id": lead["customer_id"]},
            {"$set": enriched},
        )
        updated += 1
    await _write_audit(caller["sub"], "Rescored All Customers", f"{updated} records")
    return {"rescored": updated}


# ── Bulk import ───────────────────────────────────────────────────────────────

@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    caller: dict = Depends(get_current_user),
):
    filename = file.filename.lower()
    content = await file.read()
    rows = []

    if filename.endswith(".csv"):
        text = content.decode("utf-8-sig", errors="replace")
        rows = list(csv.DictReader(io.StringIO(text)))
    elif filename.endswith((".xlsx", ".xls")):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
            ws = wb.active
            headers = [str(c.value).strip() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
            for row in ws.iter_rows(min_row=2, values_only=True):
                rows.append({headers[i]: (str(v).strip() if v is not None else "") for i, v in enumerate(row)})
        except ImportError:
            raise HTTPException(status_code=400, detail="openpyxl not installed. Use CSV format.")
    else:
        raise HTTPException(status_code=400, detail="Only .csv, .xlsx, .xls files supported")

    if not rows:
        raise HTTPException(status_code=400, detail="File is empty or has no data rows")

    ALIASES = {
        "name": ["name", "customer_name", "full_name", "customer name"],
        "age": ["age"],
        "occupation": ["occupation", "job", "job_title", "profession"],
        "cibil_score": ["cibil_score", "cibil", "credit_score"],
        "monthly_credit_1": ["monthly_credit_1", "month1", "m1", "salary_m1"],
        "monthly_credit_2": ["monthly_credit_2", "month2", "m2", "salary_m2"],
        "monthly_credit_3": ["monthly_credit_3", "month3", "m3", "salary_m3"],
        "monthly_credit_4": ["monthly_credit_4", "month4", "m4", "salary_m4"],
        "monthly_credit_5": ["monthly_credit_5", "month5", "m5", "salary_m5"],
        "monthly_credit_6": ["monthly_credit_6", "month6", "m6", "salary_m6"],
        "emi_debits": ["emi_debits", "emi", "monthly_emi"],
        "cc_spend": ["cc_spend", "credit_card_spend", "cc"],
        "credit_limit": ["credit_limit", "limit"],
        "loan_page_visits": ["loan_page_visits", "page_visits", "visits"],
        "existing_loan_count": ["existing_loan_count", "existing_loans", "loan_count"],
        "years_of_experience": ["years_of_experience", "experience", "exp", "years_exp"],
        "account_balance": ["account_balance", "balance", "bank_balance"],
        "branch": ["branch", "branch_name"],
    }

    def resolve(row, field):
        rl = {k.lower().strip(): v for k, v in row.items()}
        for alias in ALIASES.get(field, [field]):
            if alias in rl:
                return rl[alias]
        return ""

    def safe_int(v, d=0):
        try: return int(float(str(v).replace(",", "").strip())) if v else d
        except: return d

    def safe_float(v, d=0.0):
        try: return float(str(v).replace(",", "").strip()) if v else d
        except: return d

    # ── Phase 1: parse + server-side validation ───────────────────────────────
    parsed, skipped = [], []
    for i, row in enumerate(rows):
        name = resolve(row, "name").strip()
        if not name:
            skipped.append(f"Row {i+2}: missing name")
            continue
        cibil = safe_int(resolve(row, "cibil_score"), 650)
        if not (300 <= cibil <= 900):
            cibil = 650
        credits = [safe_float(resolve(row, f"monthly_credit_{n}")) for n in range(1, 7)]
        if all(c == 0 for c in credits):
            rl = {k.lower().strip(): v for k, v in row.items()}
            for col in ["income", "monthly_income", "salary", "monthly_salary"]:
                if col in rl and safe_float(rl[col]) > 0:
                    val = safe_float(rl[col])
                    credits = [val, val, val, 0, 0, 0]
                    break
        # Server-side: enforce ≥3 non-zero months (same rule as manual add)
        if sum(1 for c in credits if c > 0) < 3:
            skipped.append(f"Row {i+2} ({name}): fewer than 3 non-zero monthly credits")
            continue
        parsed.append({
            "name": name,
            "age": safe_int(resolve(row, "age"), 35),
            "occupation": resolve(row, "occupation") or "Professional",
            "cibil_score": cibil,
            "monthly_credit_1": credits[0], "monthly_credit_2": credits[1],
            "monthly_credit_3": credits[2], "monthly_credit_4": credits[3],
            "monthly_credit_5": credits[4], "monthly_credit_6": credits[5],
            "emi_debits": safe_float(resolve(row, "emi_debits")),
            "cc_spend": safe_float(resolve(row, "cc_spend")),
            "credit_limit": safe_float(resolve(row, "credit_limit")) or 100000.0,
            "loan_page_visits": safe_int(resolve(row, "loan_page_visits")),
            "existing_loan_count": safe_int(resolve(row, "existing_loan_count")),
            "years_of_experience": safe_int(resolve(row, "years_of_experience")),
            "account_balance": safe_float(resolve(row, "account_balance")),
            "branch": resolve(row, "branch") or caller.get("branch", ""),
            "assigned_to": caller["sub"],
        })

    if not parsed:
        raise HTTPException(status_code=400, detail=f"No valid rows. Issues: {skipped[:5]}")

    # ── Phase 2: batch ML scoring ─────────────────────────────────────────────
    from feature_engineering import derive_features
    from predict import predict_batch
    from loan_engine import run_loan_engine

    feature_list, ml_inputs = [], []
    for p in parsed:
        feats = derive_features(p)
        ml_inputs.append({
            **feats,
            "cibil_score": p["cibil_score"], "age": p["age"],
            "existing_loan_count": p["existing_loan_count"],
            "years_of_experience": p["years_of_experience"],
            "account_balance": p["account_balance"],
        })
        feature_list.append(feats)

    ml_results = predict_batch(ml_inputs)

    # ── Phase 3: bulk insert (with duplicate detection) ────────────────────
    from crud import find_duplicate
    docs, start_id = [], await get_next_sequence_value("customer_id")
    if len(parsed) > 1:
        await leads_col.database["counters"].find_one_and_update(
            {"_id": "customer_id"},
            {"$inc": {"sequence_value": len(parsed) - 1}},
        )

    now = datetime.utcnow()
    inserted, updated = 0, 0
    for idx, (p, feats, ml) in enumerate(zip(parsed, feature_list, ml_results)):
        engine = run_loan_engine(feats, ml["ai_score"])
        enriched_doc = {
            **p, **feats,
            "ai_score": ml["ai_score"],
            "conversion_probability": ml["conversion_probability"],
            "shap_top3": [],
            **engine,
        }
        existing = await find_duplicate(p["name"])
        if existing:
            await leads_col.update_one(
                {"customer_id": existing["customer_id"]},
                {"$set": {**enriched_doc, "updated_at": now}},
            )
            updated += 1
        else:
            docs.append({
                **enriched_doc,
                "customer_id": start_id + inserted,
                "status": "New", "last_contact": "",
                "created_at": now,
            })
            inserted += 1

    if docs:
        await leads_col.insert_many(docs)
    await _write_audit(caller["sub"], "Imported CSV", f"{inserted} inserted, {updated} updated")
    return {"imported": inserted, "updated": updated, "skipped": len(skipped), "skipped_details": skipped[:10]}


# ── Helper ────────────────────────────────────────────────────────────────────

def _assert_lead_access(caller: dict, lead: dict):
    """RM can only touch their own assigned leads. BM/Admin unrestricted."""
    role = caller.get("role")
    if role == "rm" and lead.get("assigned_to") != caller["sub"]:
        raise HTTPException(status_code=403, detail="Access denied — this lead is not assigned to you")
