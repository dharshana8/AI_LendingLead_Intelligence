from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
import bcrypt

from database import users_col, audit_col, get_next_sequence_value
from auth import create_access_token, invalidate_token

router = APIRouter(tags=["Auth"])


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def _verify(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


async def _write_audit(user: str, action: str, target: str, status: str = "Success", ip: str = "—"):
    await audit_col.insert_one({
        "user": user, "action": action, "target": target,
        "status": status, "ip": ip, "timestamp": datetime.utcnow(),
    })


def _user_dict(u: dict):
    return {
        "id": u.get("id"), "employeeId": u.get("employee_id"),
        "name": u.get("name"), "role": u.get("role"), "branch": u.get("branch"),
        "email": u.get("email"), "phone": u.get("phone"),
        "avatar": u.get("avatar"), "joined": u.get("joined"), "performance": u.get("performance"),
    }


class LoginRequest(BaseModel):
    employeeId: str
    password: str


class RegisterRequest(BaseModel):
    employeeId: str
    password: str
    name: str
    role: str = "rm"
    branch: str = "Chennai South"
    email: str = ""
    phone: str = ""


@router.post("/login")
async def login(payload: LoginRequest, request: Request):
    user = await users_col.find_one({
        "$or": [
            {"employee_id": payload.employeeId},
            {"email": payload.employeeId},
        ]
    })
    stored = user.get("password", "") if user else ""
    # Support both bcrypt hashes and legacy plain-text (for seeded demo users)
    if not user or not (
        _verify(payload.password, stored) or stored == payload.password
    ):
        await _write_audit(payload.employeeId, "Failed Login Attempt", payload.employeeId, "Failed",
                           request.client.host if request.client else "—")
        raise HTTPException(status_code=401, detail="Invalid Employee ID / Email or Password")

    # Upgrade plain-text password to bcrypt on first successful login
    if stored == payload.password and not stored.startswith("$2b$"):
        await users_col.update_one(
            {"employee_id": user["employee_id"]},
            {"$set": {"password": _hash(payload.password)}},
        )

    token = create_access_token({"sub": user["employee_id"], "role": user["role"], "branch": user.get("branch", "")})
    await _write_audit(user.get("name", payload.employeeId), "User Login", payload.employeeId,
                       ip=request.client.host if request.client else "—")
    return {**_user_dict(user), "token": token}


@router.post("/logout")
async def logout(request: Request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        invalidate_token(auth[7:])
    return {"detail": "Logged out"}


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest, request: Request):
    if await users_col.find_one({"employee_id": payload.employeeId}):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    uid = await get_next_sequence_value("user_id")
    joined = datetime.utcnow().strftime("%b %Y")
    new_user = {
        "id": uid, "employee_id": payload.employeeId, "password": _hash(payload.password),
        "name": payload.name, "role": payload.role, "branch": payload.branch,
        "email": payload.email, "phone": payload.phone,
        "avatar": "".join(w[0] for w in payload.name.split()[:2]).upper(),
        "joined": joined, "performance": 75,
    }
    await users_col.insert_one(new_user)
    await _write_audit(payload.name, "Created User", f"{payload.name} ({payload.employeeId})",
                       ip=request.client.host if request.client else "—")
    return _user_dict(new_user)
