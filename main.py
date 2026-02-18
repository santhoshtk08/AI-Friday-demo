from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3, os, uuid, hashlib
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from typing import Optional
import io

from database import init_db, get_db
from models import (
    LoginRequest, CreateFDRequest, FDFilterParams,
    PrematureClosureRequest, SystemConfigUpdate, UserCreate
)
from auth import create_session, validate_session, delete_session, get_role
from calculations import compute_maturity, compute_premature_closure
from receipt import generate_fd_receipt_pdf

# ─────────────────────────── App Lifecycle ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Fixed Deposit Management System",
    description="FD Account Opening, Maturity Tracker & Receipt Generator",
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────── CORS Configuration ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────── Auth Dependency ─────────────────────────
def require_officer(x_session_token: str = Header(...)):
    user = validate_session(x_session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in.")
    return user

def require_supervisor(x_session_token: str = Header(...)):
    user = validate_session(x_session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    if user["role"] != "supervisor":
        raise HTTPException(status_code=403, detail="Supervisor access required.")
    return user


# ═══════════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ═══════════════════════════════════════════════════════════════════════

@app.post("/auth/login", tags=["Auth"], summary="Login and receive a session token")
def login(payload: LoginRequest):
    """
    Authenticate with username + password.
    Returns a session token to be passed as `X-Session-Token` header in all subsequent requests.
    """
    db = get_db()
    hashed = hashlib.sha256(payload.password.encode()).hexdigest()
    user = db.execute(
        "SELECT id, username, role FROM users WHERE username=? AND password_hash=?",
        (payload.username, hashed)
    ).fetchone()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_session(user["id"], user["username"], user["role"])
    return {
        "message": "Login successful",
        "session_token": token,
        "username": user["username"],
        "role": user["role"],
        "note": "Pass this token as 'X-Session-Token' header in all requests."
    }


@app.post("/auth/logout", tags=["Auth"], summary="Logout and invalidate session")
def logout(x_session_token: str = Header(...)):
    deleted = delete_session(x_session_token)
    if not deleted:
        raise HTTPException(status_code=400, detail="Session not found or already expired.")
    return {"message": "Logged out successfully."}


@app.get("/auth/me", tags=["Auth"], summary="Get current user info")
def me(current_user: dict = Depends(require_officer)):
    return {
        "username": current_user["username"],
        "role": current_user["role"],
        "user_id": current_user["user_id"]
    }


# ═══════════════════════════════════════════════════════════════════════
#  SUPERVISOR — SYSTEM CONFIG
# ═══════════════════════════════════════════════════════════════════════

@app.get("/config", tags=["Supervisor - Config"], summary="View system configuration")
def get_config(current_user: dict = Depends(require_officer)):
    db = get_db()
    rows = db.execute("SELECT key, value FROM system_config").fetchall()
    db.close()
    return {r["key"]: r["value"] for r in rows}


@app.put("/config", tags=["Supervisor - Config"], summary="Update system configuration (Supervisor only)")
def update_config(payload: SystemConfigUpdate, current_user: dict = Depends(require_supervisor)):
    """
    Configurable settings:
    - `interest_type`: `simple` or `compound`
    - `penalty_percent`: e.g. `1.0` (applied on accrued interest for premature closure)
    - `default_rate_12m`, `default_rate_24m`, `default_rate_36m`: default rates by tenure
    """
    db = get_db()
    updates = payload.dict(exclude_none=True)
    for key, value in updates.items():
        db.execute(
            "INSERT INTO system_config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, str(value))
        )
    db.commit()
    db.close()
    return {"message": "Configuration updated.", "updated_fields": list(updates.keys())}


# ═══════════════════════════════════════════════════════════════════════
#  FD CREATION
# ═══════════════════════════════════════════════════════════════════════

@app.post("/fd", tags=["FD Operations"], summary="Create a new Fixed Deposit account")
def create_fd(payload: CreateFDRequest, current_user: dict = Depends(require_officer)):
    """
    Opens a new FD. System auto-calculates maturity date and maturity amount
    based on the configured interest type (simple/compound).
    """
    # Validations
    if payload.deposit_amount <= 0:
        raise HTTPException(status_code=422, detail="Deposit amount must be greater than 0.")
    if not (0 < payload.interest_rate <= 20):
        raise HTTPException(status_code=422, detail="Interest rate must be between 0 and 20%.")
    if payload.tenure_value <= 0:
        raise HTTPException(status_code=422, detail="Tenure must be positive.")

    db = get_db()
    # Fetch system config
    config = {r["key"]: r["value"] for r in db.execute("SELECT key,value FROM system_config").fetchall()}
    interest_type = config.get("interest_type", "compound")

    # Convert tenure to years
    tenure_years = payload.tenure_value / 12 if payload.tenure_unit == "months" else payload.tenure_value

    # Compute maturity
    maturity_amount = compute_maturity(
        principal=payload.deposit_amount,
        rate=payload.interest_rate / 100,
        years=tenure_years,
        interest_type=interest_type
    )

    # Compute maturity date
    start = payload.start_date
    if payload.tenure_unit == "months":
        maturity_date = start + relativedelta(months=payload.tenure_value)
    else:
        maturity_date = start + relativedelta(years=payload.tenure_value)

    # Generate FD number
    fd_no = "FD" + datetime.now().strftime("%Y%m%d%H%M%S") + str(uuid.uuid4())[:4].upper()

    db.execute("""
        INSERT INTO fd_accounts (
            fd_no, customer_name, id_type, id_number,
            deposit_amount, interest_rate, tenure_value, tenure_unit,
            start_date, maturity_date, maturity_amount,
            interest_type_used, status, created_by
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        fd_no, payload.customer_name, payload.id_type, payload.id_number,
        payload.deposit_amount, payload.interest_rate,
        payload.tenure_value, payload.tenure_unit,
        start.isoformat(), maturity_date.isoformat(),
        round(maturity_amount, 2), interest_type, "Active",
        current_user["username"]
    ))
    db.commit()
    db.close()

    return {
        "message": "Fixed Deposit created successfully.",
        "fd_no": fd_no,
        "customer_name": payload.customer_name,
        "deposit_amount": payload.deposit_amount,
        "interest_rate": payload.interest_rate,
        "tenure": f"{payload.tenure_value} {payload.tenure_unit}",
        "start_date": start.isoformat(),
        "maturity_date": maturity_date.isoformat(),
        "maturity_amount": round(maturity_amount, 2),
        "interest_type": interest_type
    }


# ═══════════════════════════════════════════════════════════════════════
#  FD REGISTER & FILTERS
# ═══════════════════════════════════════════════════════════════════════

@app.get("/fd", tags=["FD Operations"], summary="List all FDs with optional filters")
def list_fds(
    status: Optional[str] = None,
    customer_name: Optional[str] = None,
    start_date_from: Optional[date] = None,
    start_date_to: Optional[date] = None,
    maturity_date_from: Optional[date] = None,
    maturity_date_to: Optional[date] = None,
    current_user: dict = Depends(require_officer)
):
    """
    Returns FD register. Filters:
    - `status`: Active | Closed | PrematurelyClosed
    - `customer_name`: partial match
    - `start_date_from` / `start_date_to`: date range filter on start date
    - `maturity_date_from` / `maturity_date_to`: date range filter on maturity date
    """
    db = get_db()
    query = "SELECT * FROM fd_accounts WHERE 1=1"
    params = []

    if status:
        query += " AND status=?"
        params.append(status)
    if customer_name:
        query += " AND customer_name LIKE ?"
        params.append(f"%{customer_name}%")
    if start_date_from:
        query += " AND start_date >= ?"
        params.append(start_date_from.isoformat())
    if start_date_to:
        query += " AND start_date <= ?"
        params.append(start_date_to.isoformat())
    if maturity_date_from:
        query += " AND maturity_date >= ?"
        params.append(maturity_date_from.isoformat())
    if maturity_date_to:
        query += " AND maturity_date <= ?"
        params.append(maturity_date_to.isoformat())

    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    db.close()

    result = []
    for r in rows:
        result.append({
            "fd_no": r["fd_no"],
            "customer_name": r["customer_name"],
            "id_type": r["id_type"],
            "id_number": r["id_number"],
            "deposit_amount": r["deposit_amount"],
            "interest_rate": r["interest_rate"],
            "tenure": f"{r['tenure_value']} {r['tenure_unit']}",
            "start_date": r["start_date"],
            "maturity_date": r["maturity_date"],
            "maturity_amount": r["maturity_amount"],
            "interest_type": r["interest_type_used"],
            "status": r["status"],
            "created_by": r["created_by"],
            "created_at": r["created_at"]
        })
    return {"total": len(result), "fd_accounts": result}


@app.get("/fd/{fd_no}", tags=["FD Operations"], summary="Get a single FD by FD number")
def get_fd(fd_no: str, current_user: dict = Depends(require_officer)):
    db = get_db()
    row = db.execute("SELECT * FROM fd_accounts WHERE fd_no=?", (fd_no,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"FD '{fd_no}' not found.")
    return dict(row)


# ═══════════════════════════════════════════════════════════════════════
#  PREMATURE CLOSURE SIMULATION
# ═══════════════════════════════════════════════════════════════════════

@app.post("/fd/{fd_no}/simulate-closure", tags=["FD Operations"],
          summary="Simulate premature closure with penalty")
def simulate_premature_closure(
    fd_no: str,
    payload: PrematureClosureRequest,
    current_user: dict = Depends(require_officer)
):
    """
    Simulates premature closure. No ledger entries are made.
    Returns:
    - Accrued interest till closure date
    - Penalty deduction on accrued interest
    - Net payout amount
    """
    db = get_db()
    row = db.execute("SELECT * FROM fd_accounts WHERE fd_no=?", (fd_no,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail=f"FD '{fd_no}' not found.")
    if row["status"] != "Active":
        db.close()
        raise HTTPException(status_code=400, detail=f"FD is not Active. Current status: {row['status']}")

    config = {r["key"]: r["value"] for r in db.execute("SELECT key,value FROM system_config").fetchall()}
    db.close()

    penalty_pct = float(config.get("penalty_percent", "1.0"))
    interest_type = row["interest_type_used"]

    start = date.fromisoformat(row["start_date"])
    closure_date = payload.closure_date

    if closure_date <= start:
        raise HTTPException(status_code=422, detail="Closure date must be after the start date.")
    if closure_date >= date.fromisoformat(row["maturity_date"]):
        raise HTTPException(status_code=422, detail="Closure date must be before maturity date for premature closure.")

    result = compute_premature_closure(
        principal=row["deposit_amount"],
        rate=row["interest_rate"] / 100,
        start_date=start,
        closure_date=closure_date,
        interest_type=interest_type,
        penalty_percent=penalty_pct
    )

    return {
        "fd_no": fd_no,
        "customer_name": row["customer_name"],
        "principal": row["deposit_amount"],
        "original_maturity_date": row["maturity_date"],
        "simulated_closure_date": closure_date.isoformat(),
        "days_held": result["days_held"],
        "years_held": round(result["years_held"], 4),
        "accrued_interest": round(result["accrued_interest"], 2),
        "penalty_percent": penalty_pct,
        "penalty_amount": round(result["penalty_amount"], 2),
        "net_interest": round(result["net_interest"], 2),
        "net_payout": round(result["net_payout"], 2),
        "interest_type": interest_type,
        "note": "This is a simulation only. No actual closure has been performed."
    }


# ═══════════════════════════════════════════════════════════════════════
#  RECEIPT GENERATION
# ═══════════════════════════════════════════════════════════════════════

@app.get("/fd/{fd_no}/receipt", tags=["FD Operations"],
         summary="Download FD receipt as PDF")
def download_receipt(fd_no: str, current_user: dict = Depends(require_officer)):
    """
    Generates and returns a PDF receipt for the given FD.
    """
    db = get_db()
    row = db.execute("SELECT * FROM fd_accounts WHERE fd_no=?", (fd_no,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"FD '{fd_no}' not found.")

    pdf_path = generate_fd_receipt_pdf(dict(row))

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"FD_Receipt_{fd_no}.pdf"
    )


# ═══════════════════════════════════════════════════════════════════════
#  CLOSE FD (Actual)
# ═══════════════════════════════════════════════════════════════════════

@app.post("/fd/{fd_no}/close", tags=["FD Operations"],
          summary="Mark FD as Prematurely Closed (Officer action)")
def close_fd(fd_no: str, payload: PrematureClosureRequest,
             current_user: dict = Depends(require_officer)):
    """
    Marks FD as PrematurelyClosed. Updates status in DB.
    Use /simulate-closure first to preview amounts.
    """
    db = get_db()
    row = db.execute("SELECT * FROM fd_accounts WHERE fd_no=?", (fd_no,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail=f"FD '{fd_no}' not found.")
    if row["status"] != "Active":
        db.close()
        raise HTTPException(status_code=400, detail=f"FD is already {row['status']}.")

    db.execute(
        "UPDATE fd_accounts SET status='PrematurelyClosed', closed_at=? WHERE fd_no=?",
        (payload.closure_date.isoformat(), fd_no)
    )
    db.commit()
    db.close()
    return {"message": f"FD {fd_no} marked as PrematurelyClosed on {payload.closure_date}."}


@app.post("/fd/{fd_no}/mature", tags=["FD Operations"],
          summary="Mark FD as matured on or after maturity date")
def mature_fd(fd_no: str, current_user: dict = Depends(require_officer)):
    db = get_db()
    row = db.execute("SELECT * FROM fd_accounts WHERE fd_no=?", (fd_no,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="FD not found.")
    if row["status"] != "Active":
        db.close()
        raise HTTPException(status_code=400, detail=f"FD is already {row['status']}.")
    if date.today() < date.fromisoformat(row["maturity_date"]):
        db.close()
        raise HTTPException(status_code=400, detail="Maturity date has not been reached yet.")

    db.execute(
        "UPDATE fd_accounts SET status='Closed', closed_at=? WHERE fd_no=?",
        (date.today().isoformat(), fd_no)
    )
    db.commit()
    db.close()
    return {"message": f"FD {fd_no} marked as matured/closed on {date.today()}."}


# ═══════════════════════════════════════════════════════════════════════
#  SUPERVISOR — USER MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════

@app.post("/users", tags=["Supervisor - Users"], summary="Create a new user (Supervisor only)")
def create_user(payload: UserCreate, current_user: dict = Depends(require_supervisor)):
    if payload.role not in ("officer", "supervisor"):
        raise HTTPException(status_code=422, detail="Role must be 'officer' or 'supervisor'.")
    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE username=?", (payload.username,)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=409, detail=f"Username '{payload.username}' already exists.")
    hashed = hashlib.sha256(payload.password.encode()).hexdigest()
    db.execute(
        "INSERT INTO users(username, password_hash, role) VALUES(?,?,?)",
        (payload.username, hashed, payload.role)
    )
    db.commit()
    db.close()
    return {"message": f"User '{payload.username}' created with role '{payload.role}'."}


@app.get("/users", tags=["Supervisor - Users"], summary="List all users (Supervisor only)")
def list_users(current_user: dict = Depends(require_supervisor)):
    db = get_db()
    rows = db.execute("SELECT id, username, role, created_at FROM users").fetchall()
    db.close()
    return [dict(r) for r in rows]


# ═══════════════════════════════════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    return {
        "system": "Fixed Deposit Management System",
        "status": "running",
        "docs": "/docs",
        "default_credentials": {
            "supervisor": {"username": "admin", "password": "admin123"},
            "officer": {"username": "officer1", "password": "officer123"}
        }
    }