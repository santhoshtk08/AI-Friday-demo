# System Architecture Document
## Fixed Deposit Management System

**Version:** 1.0  
**Date:** February 17, 2026  
**Document Type:** Technical Architecture  
**Status:** Final

---

## 1. Executive Summary

This document describes the technical architecture of the Fixed Deposit Management System, a web-based application built using modern technologies to provide secure, scalable, and maintainable FD account management capabilities.

### 1.1 Architecture Overview

The system follows a **three-tier architecture** pattern:
- **Presentation Layer**: React-based Single Page Application (SPA)
- **Application Layer**: FastAPI REST API backend
- **Data Layer**: SQLite relational database

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Single Page Application              │  │
│  │                                                       │  │
│  │  • Login Page        • FD Register                   │  │
│  │  • Dashboard         • FD Details                    │  │
│  │  • Create FD         • System Config (Supervisor)    │  │
│  │  • User Management (Supervisor)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON (REST API)
                            │ CORS Enabled
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FastAPI REST API Server                 │  │
│  │                                                       │  │
│  │  Endpoints:                                          │  │
│  │  • /auth/*        - Authentication                   │  │
│  │  • /fd/*          - FD Management                    │  │
│  │  • /config        - System Configuration             │  │
│  │  • /users         - User Management                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐ │
│  │           Business Logic Components                   │ │
│  │                                                       │ │
│  │  • Authentication Service  • Interest Calculator     │ │
│  │  • FD Service             • Receipt Generator        │ │
│  │  • User Service           • Validation Service       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SQLite Database                         │  │
│  │                                                       │  │
│  │  Tables:                                             │  │
│  │  • users           - User accounts                   │  │
│  │  • fd_accounts     - FD records                      │  │
│  │  • sessions        - Active sessions                 │  │
│  │  • system_config   - Global settings                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              File Storage                            │  │
│  │  • PDF Receipts (receipts/)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Presentation Layer

#### 3.1.1 Technology Stack
- **Framework**: React 18.x
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Vanilla CSS with CSS Variables
- **State Management**: React Context API

#### 3.1.2 Component Structure

```
src/
├── pages/                    # Page components
│   ├── LoginPage.jsx        # Authentication
│   ├── Dashboard.jsx        # Overview & statistics
│   ├── CreateFD.jsx         # FD creation form
│   ├── FDRegister.jsx       # FD list/table
│   ├── FDDetails.jsx        # Individual FD view
│   ├── SystemConfig.jsx     # Configuration (Supervisor)
│   ├── UserManagement.jsx   # User admin (Supervisor)
│   └── Layout.jsx           # Main layout wrapper
│
├── components/              # Reusable components
│   └── ProtectedRoute.jsx   # Route guard
│
├── context/                 # Global state
│   └── AuthContext.jsx      # Authentication state
│
├── services/                # API integration
│   └── api.js              # HTTP client & API calls
│
└── styles/                  # CSS modules
    ├── index.css           # Global styles & design system
    ├── Forms.css           # Form components
    ├── Cards.css           # Card components
    ├── Tables.css          # Table components
    └── Layout.css          # Layout components
```

#### 3.1.3 Design System

The application uses a centralized design system with CSS variables:

**Color Palette:**
- Primary: Blue tones (#3b82f6 family)
- Secondary: Slate tones (#64748b family)
- Semantic: Success (green), Error (red), Warning (orange), Info (cyan)

**Typography:**
- Font: System font stack (San Francisco, Segoe UI, Roboto)
- Scale: 12px to 36px with consistent ratios

**Spacing:**
- Scale: 4px base unit (0.25rem to 4rem)

**Components:**
- Buttons, Forms, Cards, Tables, Badges
- Responsive breakpoints: 768px, 1024px

---

### 3.2 Application Layer

#### 3.2.1 Technology Stack
- **Framework**: FastAPI (Python 3.8+)
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic models
- **PDF Generation**: ReportLab
- **Date Handling**: python-dateutil

#### 3.2.2 Project Structure

```
backend/
├── main.py              # Application entry point & routes
├── database.py          # Database initialization & connection
├── models.py            # Pydantic data models
├── auth.py              # Authentication logic
├── calculations.py      # Interest calculation logic
├── receipt.py           # PDF receipt generation
├── requirements.txt     # Python dependencies
├── fd_system.db        # SQLite database file
└── receipts/           # Generated PDF storage
```

#### 3.2.3 API Architecture

**RESTful Design Principles:**
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Stateless operations (session via headers)

**Middleware Stack:**
1. CORS Middleware (allow frontend origin)
2. Request logging
3. Error handling

**Authentication Flow:**
1. Client sends credentials to `/auth/login`
2. Server validates and creates session
3. Returns session token
4. Client includes token in `X-Session-Token` header
5. Server validates token for protected endpoints

#### 3.2.4 Business Logic Components

**Authentication Service (`auth.py`):**
- User credential validation
- Password hashing (SHA-256)
- Session management
- Role-based authorization

**FD Service (`main.py`):**
- FD creation and validation
- FD retrieval and filtering
- Status management (Active, Closed, PrematurelyClosed)
- Premature closure simulation

**Interest Calculator (`calculations.py`):**
- Simple interest calculation
- Compound interest calculation
- Maturity date calculation
- Premature closure calculations

**Receipt Generator (`receipt.py`):**
- PDF template rendering
- FD details formatting
- File storage management

---

### 3.3 Data Layer

#### 3.3.1 Database Technology
- **DBMS**: SQLite 3
- **Location**: Local file (`fd_system.db`)
- **Access**: Python `sqlite3` module

#### 3.3.2 Database Schema

**users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('officer', 'supervisor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**fd_accounts Table:**
```sql
CREATE TABLE fd_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fd_no TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    deposit_amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    tenure_value INTEGER NOT NULL,
    tenure_unit TEXT NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    maturity_amount REAL NOT NULL,
    interest_type_used TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closure_date DATE,
    closure_amount REAL
);
```

**sessions Table:**
```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**system_config Table:**
```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY,
    interest_type TEXT NOT NULL DEFAULT 'compound',
    penalty_percent REAL NOT NULL DEFAULT 1.0,
    default_rate_12m REAL NOT NULL DEFAULT 6.5,
    default_rate_24m REAL NOT NULL DEFAULT 7.0,
    default_rate_36m REAL NOT NULL DEFAULT 7.5
);
```

#### 3.3.3 Data Access Patterns

**Connection Management:**
- Connection per request
- Automatic commit/rollback
- Context manager pattern

**Query Patterns:**
- Parameterized queries (SQL injection prevention)
- Row factory for dictionary results
- Transaction support for multi-step operations

---

## 4. Security Architecture

### 4.1 Authentication & Authorization

**Session-Based Authentication:**
1. User submits credentials
2. Server validates against hashed passwords
3. Session token generated (UUID)
4. Token stored in database with user association
5. Client stores token in localStorage
6. Token sent in custom header (`X-Session-Token`)

**Role-Based Access Control (RBAC):**
- Two roles: Officer, Supervisor
- Enforced at API level via dependencies
- Frontend enforces UI-level restrictions
- Protected routes check role before rendering

### 4.2 Data Security

**Password Security:**
- SHA-256 hashing (recommend bcrypt for production)
- No plaintext password storage
- Password validation on creation

**SQL Injection Prevention:**
- Parameterized queries only
- No string concatenation in SQL
- Input validation via Pydantic

**CORS Configuration:**
- Whitelist frontend origin only
- Credentials allowed
- Preflight request support

### 4.3 Session Management

**Session Lifecycle:**
- Created on login
- Validated on each request
- Deleted on logout
- No automatic expiration (recommend adding TTL)

---

## 5. Integration Architecture

### 5.1 Frontend-Backend Integration

**Communication Protocol:**
- HTTP/HTTPS
- JSON payload format
- RESTful conventions

**API Client (`api.js`):**
```javascript
const API_BASE_URL = 'http://localhost:8000';

// Centralized request handler
const request = async (endpoint, options) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['X-Session-Token'] = token;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};
```

**Error Handling:**
- HTTP status codes (200, 400, 401, 403, 404, 500)
- JSON error responses with detail messages
- Frontend displays user-friendly errors

### 5.2 File Storage Integration

**PDF Receipt Storage:**
- Location: `backend/receipts/`
- Naming: `{fd_no}_receipt.pdf`
- Generation: On-demand via ReportLab
- Delivery: File download response

---

## 6. Deployment Architecture

### 6.1 Development Environment

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

### 6.2 Production Deployment (Recommended)

**Frontend:**
- Build: `npm run build`
- Output: `dist/` folder
- Hosting: Nginx, Apache, or CDN
- Environment: Set API_BASE_URL to production backend

**Backend:**
- ASGI Server: Gunicorn with Uvicorn workers
- Reverse Proxy: Nginx
- SSL/TLS: Let's Encrypt certificates
- Database: Consider PostgreSQL for production scale

**Deployment Diagram:**
```
Internet
   │
   ▼
[Load Balancer / CDN]
   │
   ├─────────────────┬─────────────────┐
   ▼                 ▼                 ▼
[Nginx]          [Nginx]          [Nginx]
(Static Files)   (API Proxy)      (API Proxy)
   │                 │                 │
   │                 ▼                 ▼
   │           [Gunicorn]        [Gunicorn]
   │           [FastAPI]         [FastAPI]
   │                 │                 │
   │                 └────────┬────────┘
   │                          ▼
   │                    [PostgreSQL]
   │                          │
   └──────────────────────────┴─────────
                              │
                         [File Storage]
                         (PDF Receipts)
```

---

## 7. Performance Architecture

### 7.1 Frontend Optimization

**Code Splitting:**
- Route-based lazy loading
- Component-level code splitting
- Vite automatic chunking

**Asset Optimization:**
- CSS minification
- JavaScript bundling
- Tree shaking for unused code

**Caching Strategy:**
- Browser caching for static assets
- Service worker for offline capability (future)

### 7.2 Backend Optimization

**Database Optimization:**
- Indexed columns: `fd_no`, `username`, `session_token`
- Query optimization for list endpoints
- Connection pooling (for production)

**Response Optimization:**
- Pagination for large datasets
- Field selection for partial responses
- Compression (gzip) for responses

### 7.3 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | < 2s | ~1s |
| API Response Time | < 500ms | ~100ms |
| FD Creation Time | < 1s | ~300ms |
| PDF Generation | < 2s | ~500ms |
| Concurrent Users | 50+ | Tested: 10 |

---

## 8. Scalability Architecture

### 8.1 Horizontal Scaling

**Frontend:**
- Stateless SPA design
- CDN distribution
- Multiple server instances

**Backend:**
- Stateless API design
- Load balancer distribution
- Session storage in shared database

### 8.2 Vertical Scaling

**Database:**
- Migrate to PostgreSQL
- Read replicas for queries
- Write master for transactions

**Compute:**
- Increase server resources
- Optimize database queries
- Implement caching layer (Redis)

### 8.3 Future Scaling Considerations

**Microservices Migration:**
- Auth Service
- FD Management Service
- Reporting Service
- Notification Service

**Event-Driven Architecture:**
- Message queue (RabbitMQ, Kafka)
- Async processing for heavy operations
- Event sourcing for audit trail

---

## 9. Monitoring & Observability

### 9.1 Logging

**Frontend:**
- Console logging (development)
- Error tracking service (production)
- User action analytics

**Backend:**
- Request/response logging
- Error logging with stack traces
- Database query logging

### 9.2 Metrics (Recommended)

**Application Metrics:**
- Request rate
- Response time
- Error rate
- Active sessions

**Business Metrics:**
- FDs created per day
- Premature closures
- User activity
- System configuration changes

### 9.3 Alerting (Recommended)

**Critical Alerts:**
- Database connection failures
- API downtime
- Authentication failures spike
- Disk space low (for receipts)

---

## 10. Disaster Recovery

### 10.1 Backup Strategy

**Database Backup:**
- Daily automated backups
- Retention: 30 days
- Off-site storage
- Backup verification

**File Backup:**
- PDF receipts backup
- Configuration files backup

### 10.2 Recovery Procedures

**Database Recovery:**
1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application

**Application Recovery:**
1. Redeploy from version control
2. Restore configuration
3. Verify connectivity
4. Test critical paths

---

## 11. Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React | 18.x | UI components |
| Build Tool | Vite | 5.x | Development & bundling |
| Routing | React Router | 6.x | Client-side routing |
| Styling | CSS | 3 | Design system |
| Backend Framework | FastAPI | 0.100+ | REST API |
| Runtime | Python | 3.8+ | Server-side logic |
| ASGI Server | Uvicorn | Latest | Application server |
| Database | SQLite | 3 | Data persistence |
| PDF Generation | ReportLab | Latest | Receipt generation |
| Validation | Pydantic | 2.x | Data validation |

---

## 12. Architecture Decisions

### 12.1 Key Design Decisions

**Decision 1: SQLite vs PostgreSQL**
- **Choice**: SQLite
- **Rationale**: Simpler deployment, sufficient for small-medium scale, zero configuration
- **Trade-off**: Limited concurrent writes, not ideal for high-scale production
- **Migration Path**: PostgreSQL for production deployment

**Decision 2: Session-based vs Token-based Auth**
- **Choice**: Session-based with custom header
- **Rationale**: Simpler implementation, server-side session control
- **Trade-off**: Requires database lookup per request
- **Alternative**: Consider token-based for stateless scaling

**Decision 3: Vanilla CSS vs CSS Framework**
- **Choice**: Vanilla CSS with design system
- **Rationale**: Full control, no framework bloat, custom design
- **Trade-off**: More manual work, no pre-built components
- **Benefit**: Unique, professional design

**Decision 4: Monolithic vs Microservices**
- **Choice**: Monolithic
- **Rationale**: Simpler development, easier deployment, sufficient for current scale
- **Trade-off**: Harder to scale individual components
- **Migration Path**: Extract services as needed

---

## 13. Architecture Principles

### 13.1 Design Principles

1. **Separation of Concerns**: Clear layer boundaries
2. **DRY (Don't Repeat Yourself)**: Reusable components and functions
3. **SOLID Principles**: Modular, maintainable code
4. **RESTful Design**: Standard API conventions
5. **Security by Design**: Authentication and validation at every layer

### 13.2 Development Principles

1. **Code Quality**: Consistent formatting, meaningful names
2. **Error Handling**: Graceful degradation, user-friendly messages
3. **Testing**: Unit tests for business logic (recommended)
4. **Documentation**: Inline comments, API documentation
5. **Version Control**: Git with meaningful commits

---

## 14. Future Architecture Enhancements

### 14.1 Short-term (3-6 months)

- Implement comprehensive logging
- Add request rate limiting
- Implement session expiration
- Add database connection pooling
- Implement automated testing

### 14.2 Medium-term (6-12 months)

- Migrate to PostgreSQL
- Implement caching layer (Redis)
- Add email notification service
- Implement audit logging
- Add API versioning

### 14.3 Long-term (12+ months)

- Microservices architecture
- Event-driven processing
- Real-time notifications (WebSocket)
- Mobile application support
- Multi-tenancy support

---

## 15. Appendix

### 15.1 API Endpoint Reference

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /auth/login | No | - | User login |
| POST | /auth/logout | Yes | All | User logout |
| GET | /auth/me | Yes | All | Get current user |
| POST | /fd | Yes | All | Create FD |
| GET | /fd | Yes | All | List FDs |
| GET | /fd/{fd_no} | Yes | All | Get FD details |
| POST | /fd/{fd_no}/simulate-closure | Yes | All | Simulate closure |
| POST | /fd/{fd_no}/close | Yes | All | Close FD |
| POST | /fd/{fd_no}/mature | Yes | All | Mark matured |
| GET | /fd/{fd_no}/receipt | Yes | All | Download receipt |
| GET | /config | Yes | Supervisor | Get config |
| PUT | /config | Yes | Supervisor | Update config |
| GET | /users | Yes | Supervisor | List users |
| POST | /users | Yes | Supervisor | Create user |

### 15.2 Environment Variables

**Frontend:**
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000)

**Backend:**
- `FD_DB_PATH`: Database file path (default: ./fd_system.db)
- `FD_RECEIPTS_DIR`: Receipt storage directory (default: ./receipts)

### 15.3 Port Configuration

- **Frontend Dev Server**: 5173
- **Backend API Server**: 8000
- **Production**: 80 (HTTP), 443 (HTTPS)

---

**Document Status:** Final  
**Last Updated:** February 17, 2026  
**Next Review:** May 17, 2026
