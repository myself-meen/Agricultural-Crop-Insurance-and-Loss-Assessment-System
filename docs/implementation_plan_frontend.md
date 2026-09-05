# Comprehensive Implementation Plan: Agricultural Crop Insurance Frontend

Build a modern, high-trust, responsive React frontend web application for the **Agricultural Crop Insurance and Loss Assessment System** in strict compliance with the **UI/UX Design Brief (`docs/04_UI_UX_DESIGN_BRIEF.md`)**, **Technical Requirements (`docs/02_TRD.md`)**, and **SRS specifications (`docs/01_PRD.md`)**.

This plan provides a **step-by-step educational roadmap** to teach you how each concept, component, state management flow, and REST API integration is built from scratch.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions:**
> 1. **Framework & Tooling**: We will use **Vite + React (JavaScript)** created in `d:\programming-projects\ad-project\reactapp`. Vite provides sub-second HMR, clean build configuration, and fast startup compared to legacy `create-react-app`.
> 2. **Design System**: Vanilla CSS with modern CSS custom properties (design tokens), dark mode primary (`#0F172A` slate base), glassmorphism cards (`backdrop-blur-md`), dynamic grid layouts, and custom status pills as specified in `04_UI_UX_DESIGN_BRIEF.md`.
> 3. **Demo Quick-Login**: To facilitate testing across all 4 roles (`FARMER`, `INSURER`, `SURVEYOR`, `ADMIN`), the login page will include one-click demo role selector buttons pre-populating credentials.
> 4. **Port Configuration**: The frontend will run on port `8081` (`http://localhost:8081`) communicating with the Spring Boot backend REST API on port `8080` (`http://localhost:8080/api`).

---

## Open Questions

> [!NOTE]
> None at this stage. All requirements, design tokens, endpoints, and role specifications are fully documented in `docs/`.

---

## Proposed Changes & Educational Module Roadmap

The frontend implementation will be structured across **7 sequential phases**. Each phase focuses on specific engineering concepts that will be explained step-by-step during execution:

---

### 🎨 Phase 1: React Project Scaffold & Design System Setup
**Educational Focus:** Modern React setup with Vite, CSS Custom Properties (Design Tokens), Typography setup, and Layout Grid Architecture.

#### [NEW] [package.json](file:///d:/programming-projects/ad-project/reactapp/package.json)
- Configures scripts, React 18 dependencies, `react-router-dom` v6, `axios`, `lucide-react` (icons), and `vite` port `8081`.

#### [NEW] [vite.config.js](file:///d:/programming-projects/ad-project/reactapp/vite.config.js)
- Sets server port to `8081` and proxy configuration for `/api` pointing to `http://localhost:8080`.

#### [NEW] [src/styles/index.css](file:///d:/programming-projects/ad-project/reactapp/src/styles/index.css)
- Implementation of the full design system from `04_UI_UX_DESIGN_BRIEF.md`:
  - CSS variables for Slate Dark Theme (`--bg-main`, `--bg-card`, `--color-primary`, etc.)
  - Google Fonts import (`Inter`, `Plus Jakarta Sans`, `JetBrains Mono`)
  - Glassmorphic card utility classes (`.glass-card`, `.glass-panel`)
  - Operational status badge pill classes (`.badge-enrolled`, `.badge-submitted`, `.badge-approved`, `.badge-rejected`, `.badge-surveyor`)
  - Form control glowing ring focus styles and validation message styling
  - Dynamic 12-column responsive layout grid system

---

### 🔑 Phase 2: Centralized API Service Layer & Auth Context
**Educational Focus:** Axios Interceptors, JWT Token Persistence (`localStorage`), React Context API, and Client-Side Role-Based Route Guards.

#### [NEW] [src/services/api.js](file:///d:/programming-projects/ad-project/reactapp/src/services/api.js)
- Unified Axios instance configured with base URL `http://localhost:8080/api`.
- Request Interceptor: Automatically attaches `Authorization: Bearer <token>` header from `localStorage`.
- Response Interceptor: Uniform error handling (401 Unauthorized token expiry logout, 400 Bad Request extraction, 403 Forbidden handling).
- Modular API call functions for Auth, Farmer Profiles, Policies, Loss Notifications, Surveys, Claims, and Audit Logs.

#### [NEW] [src/context/AuthContext.jsx](file:///d:/programming-projects/ad-project/reactapp/src/context/AuthContext.jsx)
- Central user authentication state provider tracking `user`, `token`, `role`, and `isAuthenticated`.
- Handles `login(email, password)`, `register(userData)`, and `logout()` operations.
- Restores user state from `localStorage` on page refresh.

#### [NEW] [src/components/ProtectedRoute.jsx](file:///d:/programming-projects/ad-project/reactapp/src/components/ProtectedRoute.jsx)
- Higher-order route guard wrapper checking authentication status and allowed roles (`allowedRoles={['FARMER', 'ADMIN']}`).
- Redirects unauthenticated users to `/login` and unauthorized roles to `/unauthorized`.

---

### 🧩 Phase 3: Core Layout & Authentication Pages
**Educational Focus:** Responsive Navigation Bar, Show/Hide Password controls, Form Input Live Validation, Demo Credential Fillers, and Error Banner Notifications.

#### [NEW] [src/components/NavBar.jsx](file:///d:/programming-projects/ad-project/reactapp/src/components/NavBar.jsx)
- High-trust modern header with system logo, role-aware navigation links, active page highlight, user profile dropdown, dark/light theme toggle, and logout action.

#### [NEW] [src/components/Footer.jsx](file:///d:/programming-projects/ad-project/reactapp/src/components/Footer.jsx)
- Government & Agri-Tech compliance footer with PMFBY hotline, quick links, and system version badge.

#### [NEW] [src/pages/Home.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/Home.jsx)
- High-impact landing page showcasing crop insurance coverage, PMFBY eligibility calculator teaser, quick portal login CTAs, and workflow step cards.

#### [NEW] [src/pages/Login.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/Login.jsx)
- Modern auth panel featuring:
  - Form validation for email & password
  - Password visibility toggle (eye icon)
  - One-click demo role selector chips (`Farmer`, `Insurer`, `Surveyor`, `Admin`) auto-filling test credentials
  - Error banner display for invalid credentials

#### [NEW] [src/pages/Register.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/Register.jsx)
- Account creation form with live client-side validation:
  - Full Name: Alphabetic validation (`InvalidNameException` prevention)
  - Phone Number: 10-digit numeric validation (`InvalidPhoneException` prevention)
  - Role dropdown selector (`FARMER`, `INSURER`, `SURVEYOR`, `ADMIN`)

---

### 📊 Phase 4: Dynamic Role-Customized Dashboard
**Educational Focus:** Dynamic Conditional Rendering by Role, Metric KPI Cards, Operational Status Counters, and Quick Action Grid.

#### [NEW] [src/pages/Dashboard.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/Dashboard.jsx)
- Multi-perspective dashboard rendering tailored layouts based on `user.role`:
  - **Farmer View**: Direct action cards ("Enroll Policy", "Report Crop Loss", "Track Payouts"), enrolled policies summary, active claims timeline.
  - **Surveyor View**: Pending field assessments queue, map location coordinates list, survey submission shortcut.
  - **Insurer / Admin View**: Total Claims Disbursed KPI (₹), PMFBY Subsidy split analytics, pending actuarial approvals counter, recent audit logs table.

---

### 🌾 Phase 5: Farmer Profile & PMFBY Policy Portal
**Educational Focus:** Mathematical Form Calculations (PMFBY Subsidy Split), Multi-step Form Wizard, Dynamic State Selectors, and Card Grid Views.

#### [NEW] [src/pages/FarmerProfile.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/FarmerProfile.jsx)
- Farmer onboarding profile manager (Aadhaar, Land Area in Hectares, Bank Account / IFSC Details, State/District selection).

#### [NEW] [src/pages/PolicyPortal.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/PolicyPortal.jsx)
- Farmer policy management dashboard displaying enrolled active policies, coverage sum insured, crop season badges, and premium receipts.

#### [NEW] [src/pages/PolicyEnrollment.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/PolicyEnrollment.jsx)
- Interactive PMFBY Crop Policy Enrollment wizard featuring:
  - Live PMFBY Premium Calculator: Automatically computes **Farmer Premium** (1.5% Kharif, 2.0% Rabi, 5.0% Commercial) vs **Govt Subsidy** (95%-98.5%) based on selected crop type and sum insured.
  - Instant policy generation and submit handler calling `POST /api/policies/enroll/farmer/{id}`.

---

### 📸 Phase 6: Crop Loss Notification & Surveyor Field Assessment
**Educational Focus:** HTML5 Geolocation API, File Upload & Base64 Image Preview, GPS Coordinate Capture, and Damage Assessment Range Controls.

#### [NEW] [src/pages/LossNotification.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/LossNotification.jsx)
- Emergency crop damage reporting form:
  - Geo-Location Button: Auto-detects browser latitude & longitude via `navigator.geolocation` with manual input fallback.
  - Loss Type selection (Flood, Drought, Pest Attack, Hailstorm, Cyclone).
  - Damage Photo Upload: Multi-file selector with instant image preview thumbnails and base64/file payload preparation.
  - Calls `POST /api/loss-notifications/policy/{id}`.

#### [NEW] [src/pages/SurveyManagement.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/SurveyManagement.jsx)
- Ground assessment portal for Surveyors & Insurers:
  - **Insurer View**: Assign available surveyors to pending loss notifications (`POST /api/survey-assignments/assign`).
  - **Surveyor View**: Submit field survey results (`PUT /api/survey-assignments/{id}/submit`) with actual damage percentage slider (0% to 100%), surveyor field remarks, and verified crop photo confirmation.

---

### 💳 Phase 7: Claim Approval, DBT Payout & Audit Analytics
**Educational Focus:** Actuarial Modal Dialogs, Direct Benefit Transfer (DBT) UTR Generation, Status Timeline Visualization, Data Exporting, and Audit Trail Search.

#### [NEW] [src/pages/ClaimTracker.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/ClaimTracker.jsx)
- Complete claim settlement lifecycle tracker:
  - Claim initiation modal calculating Payout Amount = `Sum Insured * (Loss Percentage / 100)`.
  - Insurer Actuarial Approval modal (`PUT /api/claims/{id}/approve`).
  - Direct Benefit Transfer (DBT) disbursement trigger generating official 16-character UTR transaction codes (`UTR-2026828-XXXXX`) (`PUT /api/claims/{id}/disburse`).
  - Interactive Visual Step Progress Bar (`Filed` ➔ `Surveyed` ➔ `Approved` ➔ `DBT Disbursed`).

#### [NEW] [src/pages/AnalyticsDashboard.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/AnalyticsDashboard.jsx)
- Executive insights view with metrics by crop type, district breakdown, claims approval ratio, and PDF/CSV report downloader.

#### [NEW] [src/pages/AuditLogViewer.jsx](file:///d:/programming-projects/ad-project/reactapp/src/pages/AuditLogViewer.jsx)
- Security and compliance audit log viewer with search filters by user email, action type, or entity ID.

#### [NEW] [src/App.jsx](file:///d:/programming-projects/ad-project/reactapp/src/App.jsx)
- Main application component defining `BrowserRouter`, `AuthProvider`, `NavBar`, `Footer`, and all public & protected route mappings.

---

## Verification Plan

### Automated Verification
1. **Scaffold & Build Verification**:
   - Run `npm install` and `npm run build` inside `reactapp/` to ensure zero compilation or JSX syntax errors.
2. **Dev Server Execution**:
   - Launch `npm run dev` and verify server runs cleanly on `http://localhost:8081`.

### Manual End-to-End Verification Flow
1. **User Authentication & Role Switch**:
   - Test login with all 4 seeded roles (`ADMIN`, `FARMER`, `INSURER`, `SURVEYOR`).
   - Verify protected routes redirect unauthenticated users to `/login`.
2. **Farmer Workflow**:
   - Register new farmer ➔ Create Farmer Profile ➔ Calculate PMFBY Premium ➔ Enroll Policy ➔ Report Crop Loss with GPS coordinates.
3. **Surveyor & Insurer Workflow**:
   - Insurer assigns surveyor ➔ Surveyor submits 75% field loss survey ➔ Insurer approves claim ➔ Trigger DBT disbursement generating UTR code.
4. **Audit Trail Verification**:
   - Check `AuditLogViewer` to verify all operational events are tracked.
