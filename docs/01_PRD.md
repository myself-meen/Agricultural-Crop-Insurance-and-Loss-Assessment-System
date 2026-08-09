# Document 01 — Product Requirements Document (PRD)

**System Name:** Agricultural Crop Insurance and Loss Assessment System  
**Tagline:** AI & Satellite-Enabled PMFBY Compliant Crop Insurance & Loss Assessment Platform  
**Document Version:** 1.0  

---

## 1. Executive Summary & Problem Statement

### The Problem
Indian farmers face frequent crop damage due to erratic climate events (droughts, floods, hailstorms, pest attacks). Under traditional PMFBY crop insurance operations:
* Claim settlement takes 45–90 days due to manual ground inspections and paper-heavy workflows.
* Transparency is low, leading to disputes between farmers, banks, and insurance companies.
* Data errors in farmer registration and bank account seeding delay Direct Benefit Transfers (DBT).

### The Solution
The **Agricultural Crop Insurance and Loss Assessment System** is a unified digital platform built with Spring Boot 3.x and React.js. It digitizes the end-to-end lifecycle of crop insurance:
1. Instant farmer policy enrollment with automated PMFBY premium calculations.
2. Geo-tagged crop loss notification with mandatory GPS coordinates and photo evidence.
3. Mobile field surveyor assignment and yield loss evaluation.
4. Two-level actuarial claim review and Direct Benefit Transfer (DBT) disbursement with bank UTR tracking.
5. Real-time regulatory compliance reporting for DAC&FW and IRDAI.

---

## 2. Target User Personas

| Role | Persona | Key Goals |
|---|---|---|
| **Farmer** | Ramesh (Smallholder Farmer) | Wants to quickly enroll crops in PMFBY, report damage from mobile with photos, and track DBT compensation status. |
| **Bank Officer** | Priya (Rural Bank Manager) | Needs to facilitate batch farmer enrollment, collect premium contributions, and verify bank details. |
| **Field Surveyor** | Vikas (Agricultural Field Assessor) | Conducts field visits, captures ground-truth yield assessments and geo-tagged photos via mobile app. |
| **Insurance Officer** | Rajesh (Actuarial Claim Manager) | Reviews field survey evidence vs satellite NDVI metrics, approves/rejects claims, and triggers DBT payouts. |
| **State Officer** | Smt. Anitha (Agri Department Official) | Monitors regional crop loss patterns, claim ratios, and exports PMFBY compliance reports. |
| **System Admin** | Admin User | Manages user credentials, role permissions, system health monitoring, and security audit logs. |

---

## 3. Scope of Core Features

### Must-Have Features (Phase 1 MVP)
* **Auth & Security:** JWT authentication with role-based access control (RBAC), multi-credential login (Email / User ID / Phone), and custom validation exceptions (`InvalidNameException`, `InvalidPhoneException`).
* **Policy Portal:** Crop insurance policy creation, PMFBY season breakdown (Kharif, Rabi, Zaid), sum insured calculator, and farmer/state/centre premium split logic.
* **Loss Notification:** Geo-tagged loss reporting with mandatory latitude/longitude coordinates and photo upload.
* **Field Survey Management:** Mobile-responsive surveyor assignment and inspection submission with yield loss percentage evaluation.
* **Actuarial Claim Approval & DBT:** Two-level claim approval workflow and DBT UTR tracking.
* **Analytics Dashboard:** Real-time KPI summary cards, loss distribution statistics, and report generation.

### Out of Scope for Phase 1
* Native offline mobile APK builds (planned for Phase 2).
* Direct satellite imagery API procurement (simulated via mock NDVI corroborate endpoints in Phase 1).
* Multi-language voice assistance.

---

## 4. Key Success Metrics

* **Claim Processing Speed:** Reduction in claim settlement cycle time from 60 days to `< 7 days`.
* **Data Accuracy:** Zero invalid names or phone numbers accepted at backend (`100%` validation compliance).
* **System Uptime:** `99.9%` server availability.
* **Test Coverage:** `> 85%` JUnit unit test coverage on Spring Boot backend and `> 75%` React Testing Library coverage.
