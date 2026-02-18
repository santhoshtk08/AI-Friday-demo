"""
models.py — Pydantic request/response models
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import date


class LoginRequest(BaseModel):
    username: str = Field(..., example="admin")
    password: str = Field(..., example="admin123")


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="officer2")
    password: str = Field(..., min_length=6, example="pass1234")
    role:     str = Field(..., example="officer")


class CreateFDRequest(BaseModel):
    # Customer KYC
    customer_name: str = Field(..., min_length=2, max_length=200, example="Ramesh Kumar")
    id_type:       str = Field(..., example="Aadhaar")        # Aadhaar / PAN / Passport / Voter ID
    id_number:     str = Field(..., min_length=4, max_length=50, example="1234-5678-9012")

    # FD Details
    deposit_amount: float = Field(..., gt=0, example=100000.00,
                                  description="Principal deposit amount (must be > 0)")
    interest_rate:  float = Field(..., gt=0, le=20, example=7.5,
                                  description="Annual interest rate in % (0-20)")
    tenure_value:   int   = Field(..., gt=0, example=12,
                                  description="Duration as an integer (e.g. 12 months or 1 year)")
    tenure_unit:    Literal["months", "years"] = Field(..., example="months")
    start_date:     date  = Field(default_factory=date.today, example="2025-01-01")

    @validator("id_type")
    def valid_id_type(cls, v):
        allowed = {"Aadhaar", "PAN", "Passport", "Voter ID", "Driving License"}
        if v not in allowed:
            raise ValueError(f"id_type must be one of: {', '.join(allowed)}")
        return v

    @validator("tenure_value")
    def valid_tenure(cls, v, values):
        unit = values.get("tenure_unit")
        if unit == "months" and v > 240:
            raise ValueError("Tenure in months cannot exceed 240 (20 years).")
        if unit == "years" and v > 20:
            raise ValueError("Tenure in years cannot exceed 20.")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "customer_name": "Ramesh Kumar",
                "id_type": "Aadhaar",
                "id_number": "1234-5678-9012",
                "deposit_amount": 100000,
                "interest_rate": 7.5,
                "tenure_value": 12,
                "tenure_unit": "months",
                "start_date": "2025-01-01"
            }
        }


class FDFilterParams(BaseModel):
    status:            Optional[str] = None
    customer_name:     Optional[str] = None
    start_date_from:   Optional[date] = None
    start_date_to:     Optional[date] = None
    maturity_date_from: Optional[date] = None
    maturity_date_to:   Optional[date] = None


class PrematureClosureRequest(BaseModel):
    closure_date: date = Field(..., example="2025-07-01",
                               description="Intended premature closure date")

    class Config:
        json_schema_extra = {
            "example": {"closure_date": "2025-07-01"}
        }


class SystemConfigUpdate(BaseModel):
    interest_type:    Optional[Literal["simple", "compound"]] = Field(None, example="compound")
    penalty_percent:  Optional[float] = Field(None, ge=0, le=10, example=1.0)
    default_rate_12m: Optional[float] = Field(None, ge=0, le=20, example=6.5)
    default_rate_24m: Optional[float] = Field(None, ge=0, le=20, example=7.0)
    default_rate_36m: Optional[float] = Field(None, ge=0, le=20, example=7.5)

    class Config:
        json_schema_extra = {
            "example": {
                "interest_type": "compound",
                "penalty_percent": 1.0,
                "default_rate_12m": 6.5,
                "default_rate_24m": 7.0,
                "default_rate_36m": 7.5
            }
        }