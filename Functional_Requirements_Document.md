# Functional Requirements Document
## Fixed Deposit Management System

**Version:** 1.0  
**Date:** February 17, 2026  
**Project:** FD Management System  
**Document Owner:** Development Team

---

## 1. Executive Summary

The Fixed Deposit Management System is a web-based application designed to streamline the creation, tracking, and management of Fixed Deposit (FD) accounts. The system provides role-based access control, automated interest calculations, premature closure simulation, and comprehensive reporting capabilities.

---

## 2. System Overview

### 2.1 Purpose
To provide a centralized platform for banking officers and supervisors to manage Fixed Deposit accounts with accurate interest calculations, KYC tracking, and automated receipt generation.

### 2.2 Scope
- User authentication and authorization
- FD account creation and management
- Interest calculation (simple and compound)
- Premature closure with penalty calculation
- Receipt generation (PDF)
- System configuration management
- User management

### 2.3 Technology Stack
- **Frontend:** React, Vite, Vanilla CSS
- **Backend:** Python FastAPI
- **Database:** SQLite
- **PDF Generation:** ReportLab

---

## 3. User Roles and Permissions

### 3.1 Officer
**Capabilities:**
- Create new FD accounts
- View all FD accounts
- View FD details
- Simulate premature closure
- Close FD prematurely
- Mark FD as matured
- Download FD receipts
- View dashboard statistics

**Restrictions:**
- Cannot modify system configuration
- Cannot create or manage users

### 3.2 Supervisor
**Capabilities:**
- All Officer capabilities
- Modify system configuration (interest type, penalty rates, default rates)
- Create new users (Officers and Supervisors)
- View all users

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

#### FR-AUTH-001: User Login
**Description:** Users must authenticate with username and password  
**Priority:** High  
**Acceptance Criteria:**
- System validates credentials against database
- Session token generated on successful login
- Invalid credentials return error message
- Session persists across page refreshes

#### FR-AUTH-002: Role-Based Access Control
**Description:** System enforces role-based permissions  
**Priority:** High  
**Acceptance Criteria:**
- Officers cannot access supervisor-only pages
- Unauthorized access redirects to access denied page
- Session includes role information

#### FR-AUTH-003: Logout
**Description:** Users can securely logout  
**Priority:** Medium  
**Acceptance Criteria:**
- Session token invalidated on logout
- User redirected to login page
- Subsequent requests require re-authentication

---

### 4.2 FD Account Management

#### FR-FD-001: Create FD Account
**Description:** Officers can create new FD accounts with customer KYC details  
**Priority:** High  
**Acceptance Criteria:**
- Required fields: Customer name, ID type, ID number, deposit amount, interest rate, tenure, start date
- System validates all input fields
- Unique FD number generated (format: FDYYYYMMDDHHMMSSXXXX)
- Maturity date calculated based on tenure
- Maturity amount calculated using configured interest type
- FD created with "Active" status

**Input Validation:**
- Customer name: Non-empty string
- Deposit amount: Positive number
- Interest rate: 0-20%
- Tenure: Positive integer
- Start date: Valid date

#### FR-FD-002: View FD Register
**Description:** Users can view list of all FD accounts  
**Priority:** High  
**Acceptance Criteria:**
- Display all FDs in tabular format
- Show: FD number, customer name, deposit amount, rate, tenure, dates, maturity amount, status
- Support filtering by status, customer name, date range
- Click on row navigates to FD details page

#### FR-FD-003: View FD Details
**Description:** Users can view complete details of an FD account  
**Priority:** High  
**Acceptance Criteria:**
- Display customer information (name, ID type, ID number)
- Display FD information (all financial details)
- Show current status with visual badge
- Display created by information

#### FR-FD-004: Download FD Receipt
**Description:** Users can download PDF receipt for any FD  
**Priority:** Medium  
**Acceptance Criteria:**
- Generate PDF with bank branding
- Include all FD details
- Include customer KYC information
- Include maturity calculations
- Download as PDF file

---

### 4.3 Interest Calculation

#### FR-CALC-001: Simple Interest Calculation
**Description:** System calculates maturity using simple interest formula  
**Priority:** High  
**Formula:** `Maturity Amount = Principal × (1 + Rate × Years)`  
**Acceptance Criteria:**
- Accurate calculation based on formula
- Tenure converted to years (months/12)
- Result rounded to 2 decimal places

#### FR-CALC-002: Compound Interest Calculation
**Description:** System calculates maturity using compound interest formula  
**Priority:** High  
**Formula:** `Maturity Amount = Principal × (1 + Rate)^Years`  
**Acceptance Criteria:**
- Accurate calculation based on formula
- Annual compounding
- Tenure converted to years
- Result rounded to 2 decimal places

#### FR-CALC-003: Interest Type Configuration
**Description:** System uses configured interest type for all calculations  
**Priority:** High  
**Acceptance Criteria:**
- Interest type stored in system configuration
- All new FDs use current configuration
- Existing FDs retain their original interest type

---

### 4.4 Premature Closure

#### FR-CLOSE-001: Simulate Premature Closure
**Description:** Officers can simulate closure before actual closure  
**Priority:** High  
**Acceptance Criteria:**
- User selects closure date
- System calculates:
  - Days held
  - Accrued interest (pro-rated)
  - Penalty amount (% of accrued interest)
  - Net interest (accrued - penalty)
  - Net payout (principal + net interest)
- Display all calculations with breakdown
- No changes to FD status

**Validation:**
- Closure date must be after start date
- Closure date must be before maturity date
- Only active FDs can be simulated

#### FR-CLOSE-002: Execute Premature Closure
**Description:** Officers can close FD prematurely after simulation  
**Priority:** High  
**Acceptance Criteria:**
- Confirmation dialog required
- FD status changed to "PrematurelyClosed"
- Closure date and amounts recorded
- Cannot be reversed
- Receipt reflects premature closure

#### FR-CLOSE-003: Mark as Matured
**Description:** Officers can mark FD as matured on/after maturity date  
**Priority:** High  
**Acceptance Criteria:**
- Button only visible on/after maturity date
- Confirmation dialog required
- FD status changed to "Closed"
- Full maturity amount recorded

---

### 4.5 Dashboard & Reporting

#### FR-DASH-001: Dashboard Statistics
**Description:** Display key FD portfolio metrics  
**Priority:** Medium  
**Acceptance Criteria:**
- Total FDs count
- Active FDs count
- Total deposits (sum across all FDs)
- Premature closures count
- Statistics update in real-time

#### FR-DASH-002: Recent FDs
**Description:** Display 5 most recent FD accounts  
**Priority:** Low  
**Acceptance Criteria:**
- Show customer name, FD number, amount, status
- Click to view details
- Sorted by creation date (newest first)

---

### 4.6 System Configuration (Supervisor Only)

#### FR-CONFIG-001: Interest Type Configuration
**Description:** Supervisors can set global interest calculation method  
**Priority:** High  
**Acceptance Criteria:**
- Options: Simple or Compound (Annual)
- Change applies to new FDs only
- Formula displayed for reference

#### FR-CONFIG-002: Penalty Configuration
**Description:** Supervisors can set premature closure penalty percentage  
**Priority:** High  
**Acceptance Criteria:**
- Range: 0-10%
- Applied to accrued interest
- Affects all premature closures

#### FR-CONFIG-003: Default Interest Rates
**Description:** Supervisors can set default rates by tenure  
**Priority:** Medium  
**Acceptance Criteria:**
- Separate rates for 12, 24, 36 months
- Range: 0-20%
- Used as suggestions in FD creation form

---

### 4.7 User Management (Supervisor Only)

#### FR-USER-001: View Users
**Description:** Supervisors can view all system users  
**Priority:** Medium  
**Acceptance Criteria:**
- Display username, role, creation date
- Show user ID
- Tabular format

#### FR-USER-002: Create User
**Description:** Supervisors can create new users  
**Priority:** High  
**Acceptance Criteria:**
- Required fields: Username, password, role
- Username must be unique
- Password minimum 6 characters
- Role: Officer or Supervisor
- Password hashed before storage

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time < 2 seconds
- API response time < 500ms
- Support 50 concurrent users

### 5.2 Security
- Passwords hashed using SHA-256 (recommend bcrypt for production)
- Session-based authentication
- CORS configured for frontend origin
- SQL injection prevention via parameterized queries

### 5.3 Usability
- Responsive design (desktop, tablet, mobile)
- Intuitive navigation
- Form validation with error messages
- Loading states for async operations

### 5.4 Reliability
- Database transactions for data integrity
- Error handling with user-friendly messages
- Session persistence across page refreshes

### 5.5 Maintainability
- Modular code structure
- Separation of concerns (API layer, business logic, UI)
- Comprehensive CSS design system
- RESTful API design

---

## 6. Data Model

### 6.1 Users Table
- `id` (INTEGER, PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `role` (TEXT: 'officer' or 'supervisor')
- `created_at` (TIMESTAMP)

### 6.2 FD Accounts Table
- `id` (INTEGER, PRIMARY KEY)
- `fd_no` (TEXT, UNIQUE)
- `customer_name` (TEXT)
- `id_type` (TEXT)
- `id_number` (TEXT)
- `deposit_amount` (REAL)
- `interest_rate` (REAL)
- `tenure_value` (INTEGER)
- `tenure_unit` (TEXT: 'months' or 'years')
- `start_date` (DATE)
- `maturity_date` (DATE)
- `maturity_amount` (REAL)
- `interest_type_used` (TEXT: 'simple' or 'compound')
- `status` (TEXT: 'Active', 'Closed', 'PrematurelyClosed')
- `created_by` (TEXT)
- `created_at` (TIMESTAMP)
- `closure_date` (DATE, nullable)
- `closure_amount` (REAL, nullable)

### 6.3 System Configuration Table
- `id` (INTEGER, PRIMARY KEY)
- `interest_type` (TEXT: 'simple' or 'compound')
- `penalty_percent` (REAL)
- `default_rate_12m` (REAL)
- `default_rate_24m` (REAL)
- `default_rate_36m` (REAL)

### 6.4 Sessions Table
- `id` (INTEGER, PRIMARY KEY)
- `session_token` (TEXT, UNIQUE)
- `user_id` (INTEGER, FOREIGN KEY)
- `created_at` (TIMESTAMP)

---

## 7. API Endpoints

### 7.1 Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### 7.2 FD Management
- `POST /fd` - Create FD
- `GET /fd` - List all FDs
- `GET /fd/{fd_no}` - Get FD details
- `POST /fd/{fd_no}/simulate-closure` - Simulate premature closure
- `POST /fd/{fd_no}/close` - Execute premature closure
- `POST /fd/{fd_no}/mature` - Mark as matured
- `GET /fd/{fd_no}/receipt` - Download receipt

### 7.3 Configuration (Supervisor)
- `GET /config` - Get system configuration
- `PUT /config` - Update system configuration

### 7.4 User Management (Supervisor)
- `GET /users` - List all users
- `POST /users` - Create new user

---

## 8. User Interface Requirements

### 8.1 Design Principles
- Clean, professional corporate design
- Consistent color scheme and typography
- Responsive layouts
- Clear visual hierarchy
- Accessible form controls

### 8.2 Key Pages
1. **Login Page** - Simple, centered, no scrolling
2. **Dashboard** - Statistics cards, quick actions, recent FDs
3. **Create FD** - Multi-section form with live preview
4. **FD Register** - Filterable table with search
5. **FD Details** - Two-column layout with actions sidebar
6. **System Config** - Form-based configuration
7. **User Management** - Table with create form

### 8.3 Navigation
- Sidebar navigation (collapsible on mobile)
- Top navbar with user info and logout
- Breadcrumbs for context
- Role-based menu items

---

## 9. Validation Rules

### 9.1 FD Creation
- Customer name: Required, max 100 characters
- Deposit amount: Required, > 0, max 2 decimal places
- Interest rate: Required, 0-20%, max 2 decimal places
- Tenure: Required, > 0, integer
- Start date: Required, valid date

### 9.2 Premature Closure
- Closure date: Required, after start date, before maturity date
- FD must be in "Active" status

### 9.3 User Creation
- Username: Required, 3-50 characters, unique, alphanumeric
- Password: Required, minimum 6 characters
- Role: Required, must be 'officer' or 'supervisor'

---

## 10. Success Metrics

### 10.1 Functional Success
- 100% of FD calculations accurate
- Zero data loss incidents
- All role permissions enforced correctly

### 10.2 User Success
- FD creation time < 2 minutes
- Premature closure simulation < 30 seconds
- User satisfaction > 4/5

### 10.3 System Success
- 99.9% uptime
- < 1% error rate
- All API responses < 500ms

---

## 11. Future Enhancements

### 11.1 Phase 2 Features
- Email notifications for maturity
- Bulk FD creation via CSV import
- Advanced reporting and analytics
- Audit trail for all changes
- Customer portal for self-service

### 11.2 Phase 3 Features
- Integration with core banking system
- Automated interest payout
- Recurring deposits
- Mobile application
- Multi-currency support

---

## 12. Glossary

- **FD**: Fixed Deposit
- **KYC**: Know Your Customer
- **p.a.**: Per Annum (per year)
- **Maturity Date**: Date when FD term ends
- **Premature Closure**: Closing FD before maturity date
- **Accrued Interest**: Interest earned up to a specific date
- **Net Payout**: Final amount paid to customer

---

## 13. Appendix

### 13.1 Sample Calculations

**Simple Interest Example:**
- Principal: ₹100,000
- Rate: 7.5% p.a.
- Tenure: 12 months (1 year)
- Maturity = 100,000 × (1 + 0.075 × 1) = ₹107,500

**Compound Interest Example:**
- Principal: ₹100,000
- Rate: 7.5% p.a.
- Tenure: 12 months (1 year)
- Maturity = 100,000 × (1.075)^1 = ₹107,500

**Premature Closure Example:**
- Principal: ₹100,000
- Rate: 7.5% p.a.
- Tenure: 12 months
- Closed after: 6 months
- Accrued Interest: ₹3,750
- Penalty (1%): ₹37.50
- Net Interest: ₹3,712.50
- Net Payout: ₹103,712.50

---

**Document Status:** Final  
**Approved By:** [Pending]  
**Date:** February 17, 2026
