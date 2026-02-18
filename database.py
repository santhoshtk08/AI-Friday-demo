"""
database.py — SQLite setup and connection helper
"""

import sqlite3
import hashlib
import os

DB_PATH = os.environ.get("FD_DB_PATH", "fd_system.db")


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create all tables and seed default data on first run."""
    db = get_db()

    # ── Users ─────────────────────────────────────────────────────────
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            username     TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role         TEXT NOT NULL CHECK(role IN ('officer','supervisor')),
            created_at   TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Sessions (in-memory key-value via DB for simplicity) ──────────
    db.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT PRIMARY KEY,
            user_id    INTEGER NOT NULL,
            username   TEXT NOT NULL,
            role       TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── System Config ─────────────────────────────────────────────────
    db.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)

    # ── FD Accounts ───────────────────────────────────────────────────
    db.execute("""
        CREATE TABLE IF NOT EXISTS fd_accounts (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            fd_no             TEXT NOT NULL UNIQUE,
            customer_name     TEXT NOT NULL,
            id_type           TEXT NOT NULL,
            id_number         TEXT NOT NULL,
            deposit_amount    REAL NOT NULL,
            interest_rate     REAL NOT NULL,
            tenure_value      INTEGER NOT NULL,
            tenure_unit       TEXT NOT NULL CHECK(tenure_unit IN ('months','years')),
            start_date        TEXT NOT NULL,
            maturity_date     TEXT NOT NULL,
            maturity_amount   REAL NOT NULL,
            interest_type_used TEXT NOT NULL,
            status            TEXT NOT NULL DEFAULT 'Active'
                              CHECK(status IN ('Active','Closed','PrematurelyClosed')),
            closed_at         TEXT,
            created_by        TEXT NOT NULL,
            created_at        TEXT DEFAULT (datetime('now'))
        )
    """)

    db.commit()

    # ── Seed default users ─────────────────────────────────────────────
    existing = db.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
    if existing == 0:
        users = [
            ("admin",    hashlib.sha256(b"admin123").hexdigest(),   "supervisor"),
            ("officer1", hashlib.sha256(b"officer123").hexdigest(), "officer"),
        ]
        db.executemany(
            "INSERT OR IGNORE INTO users(username,password_hash,role) VALUES(?,?,?)", users
        )
        db.commit()
        print("[DB] Default users seeded: admin / officer1")

    # ── Seed default config ────────────────────────────────────────────
    defaults = [
        ("interest_type",    "compound"),   # 'simple' or 'compound'
        ("penalty_percent",  "1.0"),        # % of accrued interest as penalty
        ("default_rate_12m", "6.5"),        # default rate for 12-month FD
        ("default_rate_24m", "7.0"),        # default rate for 24-month FD
        ("default_rate_36m", "7.5"),        # default rate for 36-month FD
    ]
    for key, value in defaults:
        db.execute(
            "INSERT OR IGNORE INTO system_config(key,value) VALUES(?,?)", (key, value)
        )
    db.commit()
    print("[DB] Database initialised successfully.")
    db.close()