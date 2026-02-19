# User Manual
## Fixed Deposit Management System

**Version:** 1.0 | **Date:** February 19, 2026

---

## Getting Started

### Accessing the System
1. Open your browser and go to: **http://localhost:5173**
2. Enter your username and password
3. Click **Sign In**

### Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Supervisor (Admin) | `admin` | `admin123` |
| Officer | `officer1` | `officer123` |

### Logging Out
Click your username in the top-right corner → **Logout**

---

## 👤 Officer Role — User Guide

Officers can create FDs, view and manage existing FDs, and download receipts.

---

### 1. Dashboard

After login, the **Dashboard** shows:
- **Total FDs** — all FDs in the system
- **Active FDs** — FDs currently running
- **Total Deposits** — combined deposit amount
- **Premature Closures** — count of FDs closed early
- **Recent FDs** — 5 most recently created FDs

> Click any FD row to view its details.

---

### 2. Creating a Fixed Deposit

**Navigation:** Sidebar → **Create FD**

**Step 1 — Customer KYC**
| Field | Description |
|-------|-------------|
| Customer Name | Full name of the customer |
| ID Type | Select from: Aadhaar, PAN, Passport, Voter ID, Driving License |
| ID Number | Enter the document number |

**Step 2 — FD Information**
| Field | Description |
|-------|-------------|
| Deposit Amount (₹) | Principal amount (must be > 0) |
| Interest Rate (% p.a.) | Annual rate between 0–20% |
| Tenure | Duration (e.g., 12) |
| Tenure Unit | Months or Years |
| Start Date | Date the FD begins (defaults to today) |

**Step 3 — Review the Maturity Preview**
The right-side panel shows a live preview of:
- Maturity Date
- Interest Earned
- Maturity Amount
- Interest Type being used (Simple or Compound)

**Step 4 — Submit**
Click **Create FD**. A confirmation appears with the FD number.

> ⚠️ The interest formula (Simple or Compound) is set by the Supervisor in System Config.

---

### 3. FD Register (View All FDs)

**Navigation:** Sidebar → **FD Register**

Shows all FDs in a table with columns:
- FD Number, Customer Name, Deposit Amount, Rate, Tenure, Start Date, Maturity Date, Maturity Amount, Status

**Filtering FDs:**
- Filter by **Status**: Active / Closed / PrematurelyClosed
- Filter by **Customer Name**
- Filter by **Date Range**
- Click **Clear** to reset all filters

**Click any row** to open the FD Details page.

---

### 4. FD Details

**Navigation:** FD Register → Click any FD row

Displays:
- Full customer KYC information
- Complete FD financial details
- Current status badge (Active / Closed / Prematurely Closed)
- Created by and created at information

**Available Actions:**

#### 📄 Download Receipt
Click **Download Receipt** to get a PDF receipt for the FD.

#### 🔄 Simulate Premature Closure
1. Click **Simulate Premature Closure**
2. Enter the intended closure date
3. Review the breakdown:

| Item | Description |
|------|-------------|
| Days Held | Number of days the FD was held |
| Accrued Interest | Interest earned up to closure date |
| Penalty Amount | Deduction (% of accrued interest) |
| Net Interest | Accrued interest minus penalty |
| Net Payout | Principal + Net Interest |

> This is only a simulation — no changes are made to the FD.

#### ❌ Close FD Prematurely
1. First simulate the closure to review amounts
2. Click **Execute Premature Closure**
3. Confirm the action in the dialog
4. Status changes to **Prematurely Closed** — this **cannot be undone**

#### ✅ Mark as Matured
- This button appears **only on or after the maturity date**
- Click **Mark as Matured** and confirm
- Status changes to **Closed**

---

## 🛡️ Supervisor (Admin) Role — User Guide

Supervisors have all Officer capabilities **plus** System Configuration and User Management.

---

### 5. System Configuration *(Supervisor Only)*

**Navigation:** Sidebar → **System Config**

Configure global settings that apply to **all new FDs**:

#### Interest Type
| Option | Formula |
|--------|---------|
| Simple Interest | Principal × (1 + Rate × Years) |
| Compound Interest (Annual) | Principal × (1 + Rate)^Years |

> ⚠️ Changing the interest type only affects **new FDs**. Existing FDs keep their original formula.

#### Premature Closure Penalty (%)
- Range: 0–10%
- This percentage is deducted from the accrued interest when an FD is closed early
- Example: 1% penalty on ₹5,000 accrued interest = ₹50 penalty deducted

#### Default Interest Rates by Tenure
Set suggested interest rates for:
- **12 Months** (e.g., 6.5%)
- **24 Months** (e.g., 7.0%)
- **36 Months** (e.g., 7.5%)

These appear as pre-filled values in the Create FD form.

**To Save:** Click **Save Configuration**
**To Reset:** Click **Reset** to reload the last saved values

---

### 6. User Management *(Supervisor Only)*

**Navigation:** Sidebar → **User Management**

#### View All Users
Displays a table of all system users with:
- Username, Role, User ID, Created Date

#### Create a New User
1. Click **Create New User**
2. Fill in the form:

| Field | Rules |
|-------|-------|
| Username | 3–50 characters, alphanumeric, must be unique |
| Password | Minimum 6 characters |
| Role | Officer or Supervisor |

3. Click **Create User**

> Passwords are securely hashed and cannot be recovered. Share credentials securely.

---

## 🔑 Role Summary

| Feature | Officer | Supervisor |
|---------|---------|------------|
| Login / Logout | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
| Create FD | ✅ | ✅ |
| View FD Register | ✅ | ✅ |
| View FD Details | ✅ | ✅ |
| Download Receipt | ✅ | ✅ |
| Simulate Closure | ✅ | ✅ |
| Close FD Prematurely | ✅ | ✅ |
| Mark FD as Matured | ✅ | ✅ |
| System Configuration | ❌ | ✅ |
| User Management | ❌ | ✅ |

---

## ⚠️ Important Notes

1. **Premature closure is irreversible** — always simulate first to verify amounts
2. **Mark as Matured** is only available on or after the maturity date
3. **Interest type changes** apply to new FDs only — existing FDs are not affected
4. **Passwords cannot be recovered** — if forgotten, a Supervisor must create a new account
5. **Session is stored in your browser** — clearing browser data will log you out

---

## ❓ Common Issues

| Issue | Solution |
|-------|----------|
| Cannot log in | Check username/password. Contact Supervisor if locked out. |
| Create FD button greyed out | Fill all required fields (marked with *) |
| Premature closure button not visible | FD may already be closed or matured |
| Mark as Matured not visible | The maturity date has not been reached yet |
| Receipt download fails | Ensure you are connected to the backend server |
| Config page not accessible | You need Supervisor role to access System Config |

---

*For technical support, contact your system administrator.*
