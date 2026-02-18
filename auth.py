"""
auth.py — Simple session-based auth (no JWT)
Sessions stored in SQLite for persistence across restarts.
"""

import uuid
from datetime import datetime, timedelta
from database import get_db

SESSION_TTL_HOURS = 8  # Sessions expire after 8 hours


def create_session(user_id: int, username: str, role: str) -> str:
    """Create a new session token and persist it to DB."""
    token = str(uuid.uuid4())
    db = get_db()
    # Clean up old sessions for this user first
    db.execute("DELETE FROM sessions WHERE username=?", (username,))
    db.execute(
        "INSERT INTO sessions(token, user_id, username, role) VALUES(?,?,?,?)",
        (token, user_id, username, role)
    )
    db.commit()
    db.close()
    return token


def validate_session(token: str) -> dict | None:
    """
    Validate a session token.
    Returns user dict if valid, None if expired or not found.
    """
    if not token:
        return None

    db = get_db()
    row = db.execute(
        "SELECT * FROM sessions WHERE token=?", (token,)
    ).fetchone()
    db.close()

    if not row:
        return None

    # Check TTL
    created_at = datetime.fromisoformat(row["created_at"])
    if datetime.utcnow() - created_at > timedelta(hours=SESSION_TTL_HOURS):
        # Expired — clean up
        db = get_db()
        db.execute("DELETE FROM sessions WHERE token=?", (token,))
        db.commit()
        db.close()
        return None

    return {
        "user_id":  row["user_id"],
        "username": row["username"],
        "role":     row["role"],
    }


def delete_session(token: str) -> bool:
    """Invalidate (logout) a session. Returns True if deleted."""
    db = get_db()
    cur = db.execute("DELETE FROM sessions WHERE token=?", (token,))
    db.commit()
    db.close()
    return cur.rowcount > 0


def get_role(token: str) -> str | None:
    """Quick helper to get just the role from a token."""
    user = validate_session(token)
    return user["role"] if user else None