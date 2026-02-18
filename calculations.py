"""
calculations.py — FD maturity and premature closure computation
"""

from datetime import date


def compute_maturity(
    principal: float,
    rate: float,       # as decimal, e.g. 0.075 for 7.5%
    years: float,
    interest_type: str = "compound"
) -> float:
    """
    Compute maturity amount.

    Simple Interest:
        Maturity = Principal × (1 + Rate × Years)

    Annual Compound Interest:
        Maturity = Principal × (1 + Rate) ^ Years
    """
    if interest_type == "simple":
        return principal * (1 + rate * years)
    else:  # compound (annual)
        return principal * ((1 + rate) ** years)


def compute_premature_closure(
    principal: float,
    rate: float,          # decimal
    start_date: date,
    closure_date: date,
    interest_type: str,
    penalty_percent: float  # e.g. 1.0 means 1% of accrued interest
) -> dict:
    """
    Simulate premature closure:
      1. Compute accrued interest up to closure_date
      2. Deduct penalty_percent% from accrued interest
      3. Net payout = principal + net_interest

    Returns a dict with all breakdown figures.
    """
    days_held = (closure_date - start_date).days
    years_held = days_held / 365.25  # account for leap years

    if interest_type == "simple":
        accrued_amount = compute_maturity(principal, rate, years_held, "simple")
    else:
        accrued_amount = compute_maturity(principal, rate, years_held, "compound")

    accrued_interest = accrued_amount - principal
    penalty_amount   = accrued_interest * (penalty_percent / 100)
    net_interest     = accrued_interest - penalty_amount
    net_payout       = principal + net_interest

    return {
        "days_held":       days_held,
        "years_held":      years_held,
        "accrued_interest": accrued_interest,
        "penalty_amount":  penalty_amount,
        "net_interest":    net_interest,
        "net_payout":      net_payout,
    }