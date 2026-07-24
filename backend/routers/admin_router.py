from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from database import users_col, audit_col
from schemas import UserSettingsRequest
from auth import require_admin, get_current_user
import bcrypt

router = APIRouter(tags=["Admin"])

def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def _verify(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return password == hashed  # plain-text fallback for legacy seeded users


# ── Audit Logs (Admin only) ───────────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = Query(default=100, le=500),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    caller: dict = Depends(require_admin),
):
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"user":   {"$regex": search, "$options": "i"}},
            {"action": {"$regex": search, "$options": "i"}},
            {"target": {"$regex": search, "$options": "i"}},
        ]
    cursor = audit_col.find(query).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=None)
    for log in logs:
        log.pop("_id", None)
        if isinstance(log.get("timestamp"), datetime):
            log["timestamp"] = log["timestamp"].isoformat()
    return logs


# ── User Settings ─────────────────────────────────────────────────────────────

@router.get("/users/{employee_id}/settings")
async def get_user_settings(employee_id: str, caller: dict = Depends(get_current_user)):
    # Users can only read their own settings; Admin can read any
    if caller.get("role") != "admin" and caller["sub"] != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")
    user = await users_col.find_one({"employee_id": employee_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"settings": user.get("settings", {})}


@router.put("/users/{employee_id}/settings")
async def update_user_settings(
    employee_id: str,
    payload: UserSettingsRequest,
    caller: dict = Depends(get_current_user),
):
    if caller.get("role") != "admin" and caller["sub"] != employee_id:
        raise HTTPException(status_code=403, detail="Access denied")
    user = await users_col.find_one({"employee_id": employee_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_none=True)

    # Password change — validate current password server-side before allowing update
    new_password = updates.pop("password", None)
    current_password = updates.pop("current_password", None)
    if new_password is not None:
        if not current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password")
        if not _verify(current_password, user.get("password", "")):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
        await users_col.update_one({"employee_id": employee_id}, {"$set": {"password": _hash(new_password)}})
        await audit_col.insert_one({
            "user": caller["sub"], "action": "Changed Password", "target": employee_id,
            "status": "Success", "ip": "—", "timestamp": datetime.utcnow(),
        })
        if not updates:
            return {"settings": user.get("settings", {}), "detail": "Password changed"}

    merged = {**user.get("settings", {}), **updates}
    await users_col.update_one({"employee_id": employee_id}, {"$set": {"settings": merged}})
    return {"settings": merged}


# ── User Management (Admin only) ──────────────────────────────────────────────

@router.get("/users")
async def list_users(caller: dict = Depends(require_admin)):
    cursor = users_col.find({})
    users = await cursor.to_list(length=None)
    for u in users:
        u.pop("_id", None)
        u.pop("password", None)
    return users


@router.put("/users/{employee_id}")
async def update_user(employee_id: str, payload: dict, caller: dict = Depends(require_admin)):
    user = await users_col.find_one({"employee_id": employee_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    allowed = {"name", "role", "branch", "email", "phone", "performance", "enabled"}
    updates = {k: v for k, v in payload.items() if k in allowed}
    await users_col.update_one({"employee_id": employee_id}, {"$set": updates})
    await audit_col.insert_one({
        "user": caller["sub"], "action": "Updated User", "target": employee_id,
        "status": "Success", "ip": "—", "timestamp": datetime.utcnow(),
    })
    return {"detail": "Updated"}


@router.post("/users/{employee_id}/reset-password")
async def reset_password(employee_id: str, payload: dict, caller: dict = Depends(require_admin)):
    new_password = payload.get("password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user = await users_col.find_one({"employee_id": employee_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await users_col.update_one({"employee_id": employee_id}, {"$set": {"password": _hash(new_password)}})
    await audit_col.insert_one({
        "user": caller["sub"], "action": "Reset Password", "target": employee_id,
        "status": "Success", "ip": "—", "timestamp": datetime.utcnow(),
    })
    return {"detail": "Password reset"}


@router.delete("/users/{employee_id}", status_code=204)
async def delete_user(employee_id: str, caller: dict = Depends(require_admin)):
    if employee_id == caller["sub"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await users_col.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await audit_col.insert_one({
        "user": caller["sub"], "action": "Deleted User", "target": employee_id,
        "status": "Success", "ip": "—", "timestamp": datetime.utcnow(),
    })
