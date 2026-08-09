# Document 02 — Technical Requirements Document (TRD)

**System Name:** Agricultural Crop Insurance and Loss Assessment System  
**Architecture:** Layered Enterprise Architecture (Controller -> Service -> Repository -> Database)  
**Document Version:** 1.0  

---

## 1. Technology Stack Selection

| Layer | Technology | Version / Specification | Rationale |
|---|---|---|---|
| **Frontend Framework** | React.js | `18.x` | Component-driven architecture, fast VDOM rendering, rich ecosystem. |
| **Routing & State** | React Router DOM | `v6.x` | Declarative routing with nested layouts and protected route guards. |
| **Styling** | Vanilla CSS / CSS Modules | Standard | Maximum flexibility, custom design tokens, modern glassmorphism UI without Tailwind dependencies unless requested. |
| **Backend Runtime** | Java OpenJDK | `17 LTS` | Enterprise stability, modern Java features (records, pattern matching). |
| **Backend Framework** | Spring Boot | `3.x` | Robust REST API development, automatic dependency injection, embedded Tomcat. |
| **Security** | Spring Security + JWT | `6.x` / HS256 | Stateless JWT-based RBAC authentication with role claims. |
| **Database ORM** | Spring Data JPA / Hibernate | `3.x` | Object-Relational Mapping with seamless transaction management. |
| **Database Engine** | MySQL / PostgreSQL | `8.0+ / 14+` | Relational integrity for financial policy & claim transactions. |
| **Testing** | JUnit 5 + Mockito + RTL | Standard | Backend service/controller unit tests and frontend component tests. |
| **Containerization** | Docker + Docker Compose | Standard | Multi-container setup for backend API (8080), frontend (8081), and MySQL (3306). |

---

## 2. Ports & Networking Architecture

* **Frontend Web App:** Port `8081` (`http://localhost:8081`)
* **Backend REST API:** Port `8080` (`http://localhost:8080/api`)
* **Database Connection:** Port `3306` (`jdbc:mysql://localhost:3306/crop_insurance_db`)
* **CORS Policy:** Allowed Origin `http://localhost:8081`, Allowed Methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), Allowed Headers (`Authorization`, `Content-Type`).

---

## 3. Project Folder Structure Conventions

### Backend Folder Structure (`src/main/java/com/examly/springapp/`)
```
com.examly.springapp/
├── SpringappApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── PolicyController.java
│   ├── LossNotificationController.java
│   ├── SurveyAssignmentController.java
│   ├── ClaimController.java
│   └── AnalyticsController.java
├── model/
│   ├── User.java
│   ├── Policy.java
│   ├── LossNotification.java
│   ├── SurveyAssignment.java
│   ├── Claim.java
│   └── Role.java (Enum)
├── repository/
│   ├── UserRepository.java
│   ├── PolicyRepository.java
│   ├── LossNotificationRepository.java
│   ├── SurveyAssignmentRepository.java
│   └── ClaimRepository.java
├── service/
│   ├── AuthService.java
│   ├── PolicyService.java
│   ├── LossNotificationService.java
│   ├── SurveyAssignmentService.java
│   └── ClaimService.java
├── exception/
│   ├── InvalidNameException.java
│   ├── InvalidPhoneException.java
│   ├── DuplicateClaimException.java
│   ├── UnauthorisedAccessException.java
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
└── dto/
    ├── LoginRequest.java
    ├── RegisterRequest.java
    ├── AuthResponse.java
    ├── PolicyDTO.java
    └── ClaimDTO.java
```

### Frontend Folder Structure (`src/`)
```
src/
├── components/
│   ├── NavBar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   └── ErrorBoundary.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── PolicyPortal.jsx
│   ├── LossNotification.jsx
│   ├── SurveyManagement.jsx
│   ├── ClaimTracker.jsx
│   └── AnalyticsDashboard.jsx
├── services/
│   └── api.js
├── styles/
│   └── index.css
├── App.jsx
└── index.js
```

---

## 4. Environment Variables Specification

```env
# Backend Application Properties (application.properties)
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/crop_insurance_db?createDatabaseIfNotExist=true&useSSL=false
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=rootpassword
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=true

# Security Config
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# Frontend Environment Variables (.env)
REACT_APP_API_BASE_URL=http://localhost:8080/api
PORT=8081
```
