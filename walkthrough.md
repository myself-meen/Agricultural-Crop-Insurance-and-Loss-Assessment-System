# Walkthrough — Backend Service & Controller Layers

We have created the **Service Layer** (business logic) and **Controller Layer** (REST API endpoints) across all 7 backend modules.

---

## 1. Summary of Created Components

### Module 1: User Management
- **[UserService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/UserService.java)**: Handles user creation, role filtering, duplicate email/phone validation, updating, and deletion.
- **[UserController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/UserController.java)**: Exposes `/api/users` REST endpoints (`POST`, `GET`, `PUT`, `DELETE`).

### Module 2: Farmer Profiles
- **[FarmerProfileService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/FarmerProfileService.java)**: Manages farmer profile registration, Aadhaar uniqueness checks, land area details, and bank account info.
- **[FarmerProfileController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/FarmerProfileController.java)**: Exposes `/api/farmer-profiles` endpoints for farmer onboarding and updates.

### Module 3: Policy Management & PMFBY Calculation
- **[PolicyService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/PolicyService.java)**: Enrolls crop insurance policies, auto-generates policy numbers (`POL-XXXXX`), and auto-calculates farmer vs government premium subsidy split.
- **[PolicyController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/PolicyController.java)**: Exposes `/api/policies` endpoints for enrollment, status tracking, and farmer policy queries.

### Module 4: Crop Loss Notification
- **[LossNotificationService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/LossNotificationService.java)**: Allows farmers to report crop loss with geo-tags (latitude/longitude), loss type, photo evidence, and status tracking.
- **[LossNotificationController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/LossNotificationController.java)**: Exposes `/api/loss-notifications` endpoints for reporting and filtering loss notifications.

### Module 5: Survey Assignment & Ground Evaluation
- **[SurveyAssignmentService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/SurveyAssignmentService.java)**: Assigns surveyors to loss reports, records field survey dates, loss percentage assessment, remarks, and photo uploads.
- **[SurveyAssignmentController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/SurveyAssignmentController.java)**: Exposes `/api/survey-assignments` endpoints for assigning surveyors and submitting survey reports.

### Module 6: Claim Payout & Direct Benefit Transfer (DBT)
- **[ClaimService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/ClaimService.java)**: Calculates claim payout based on sum insured and survey loss percentage, handles actuarial approval, and processes DBT disbursement with UTR transaction codes.
- **[ClaimController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/ClaimController.java)**: Exposes `/api/claims` endpoints for initiation, approval, rejection, and disbursement.

### Module 7: Audit Logging
- **[AuditLogService.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/service/AuditLogService.java)**: Logs user operations and system events for security and compliance tracking.
- **[AuditLogController.java](file:///d:/programming-projects/ad-project/springapp/src/main/java/com/examly/springapp/controller/AuditLogController.java)**: Exposes `/api/audit-logs` endpoints for querying audit logs by user or entity.

---

## 2. API Endpoints Map

```
POST   /api/users                      -> Register/create user
GET    /api/users                      -> Get all users
GET    /api/users/{id}                 -> Get user by ID
GET    /api/users/role/{role}          -> Get users by role (FARMER, INSURER, SURVEYOR, ADMIN)

POST   /api/farmer-profiles/user/{id}  -> Create farmer profile
GET    /api/farmer-profiles/user/{id}  -> Get profile by user ID

POST   /api/policies/enroll/farmer/{id}-> Enroll policy with auto PMFBY premium calculation
GET    /api/policies/farmer/{id}       -> Get policies for farmer

POST   /api/loss-notifications/policy/{id} -> Report crop loss with GPS & photos
GET    /api/loss-notifications         -> Get all loss notifications

POST   /api/survey-assignments/assign  -> Assign surveyor to loss notification
PUT    /api/survey-assignments/{id}/submit -> Submit field survey results

POST   /api/claims/initiate            -> Calculate & initiate claim payout
PUT    /api/claims/{id}/approve        -> Approve claim payout amount
PUT    /api/claims/{id}/disburse       -> Disburse payout via Direct Benefit Transfer (DBT UTR)

POST   /api/audit-logs                 -> Log system event
GET    /api/audit-logs                 -> Retrieve audit logs
```
