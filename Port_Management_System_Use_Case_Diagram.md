# Port Management System - Use Case Diagram

## System Overview

The Port Management System is a comprehensive Spring Boot + React application designed to manage port operations with role-based access control, featuring two main user roles: **ADMIN** and **USER**.

## Actors

### Primary Actors:

1. **Administrator (ADMIN)** - Full system access with all CRUD operations
2. **User (USER)** - Limited access with primarily read operations and some specific write permissions

### Secondary Actors:

3. **System** - Automated system processes (monitoring, cleanup, notifications)
4. **External Systems** - Email services, monitoring services

---

## Use Case Diagram

```
                    Port Management System
    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │  ┌─────────────────────────────────────────────────────────────┐    │
    │  │                Authentication & Authorization                │    │
    │  │                                                             │    │
ADMIN│  │  ◯ Login/Logout                                            │    │USER
  ───┼──┼──● Register Users                                          │    ├───
     │  │  ◯ Change Password                                         │    │
     │  │  ◯ Reset Password (Request/Execute)                        │    │
     │  │  ● Manage User Accounts (CRUD)                             │    │
     │  │  ● Debug Authentication                                    │    │
     │  │  ◯ Validate Tokens                                         │    │
     │  └─────────────────────────────────────────────────────────────┘    │
     │                                                                     │
     │  ┌─────────────────────────────────────────────────────────────┐    │
     │  │                    Core Operations                          │    │
     │  │                                                             │    │
     │  │  ◯ View Dashboard/Analytics                                 │    │
     │  │  ◯ View Summary Data                                        │    │
     │  │  ● Manage Ships (Navires) - CRUD                          │    │
     │  │  ● Manage Containers (Conteneurs) - CRUD                  │    │
     │  │  ● Manage Container Types - CRUD                          │    │
     │  │  ● Manage Port Calls (Escales) - CRUD                     │    │
     │  │  ● Manage Operations - CRUD                               │    │
     │  │  ◯ View Operations with Details                            │    │
     │  │  ◯ Assign Containers to Ships                              │    │
     │  └─────────────────────────────────────────────────────────────┘    │
     │                                                                     │
     │  ┌─────────────────────────────────────────────────────────────┐    │
     │  │                Resource Management                          │    │
     │  │                                                             │    │
     │  │  ● Manage Teams (Equipes) - CRUD                          │    │
     │  │  ● Manage Personnel - CRUD                                │    │
     │  │  ● Manage Equipment (Engins) - CRUD                       │    │
     │  │  ● Manage Subcontractors (Soustraiteurs) - CRUD          │    │
     │  │  ● Manage Shifts - CRUD                                   │    │
     │  │  ● Manage Stops/Downtime (Arrets) - CRUD                 │    │
     │  │  ◯ View Resource Availability                              │    │
     │  └─────────────────────────────────────────────────────────────┘    │
     │                                                                     │
     │  ┌─────────────────────────────────────────────────────────────┐    │
     │  │                System Administration                        │    │
     │  │                                                             │    │
     │  │  ● Access Performance Monitoring                           │    │
     │  │  ● View System Metrics (CPU, Memory, Health)              │    │
     │  │  ● Manage Performance Alerts                              │    │
     │  │  ● Control Monitoring Status                              │    │
     │  │  ● Access System Settings                                 │    │
     │  │  ● Perform Maintenance Operations                         │    │
     │  │  ● Fix System Data/Passwords                              │    │
     │  │  ● View System Health Information                         │    │
     │  └─────────────────────────────────────────────────────────────┘    │
     │                                                                     │
     │  ┌─────────────────────────────────────────────────────────────┐    │
     │  │                    System Services                          │    │
     │  │                                                             │    │
     │  │  Auto Account Lockout Management  ←──────────── System     │    │
     │  │  Auto Performance Monitoring      ←──────────── System     │    │
     │  │  Auto Backup Operations          ←──────────── System     │    │
     │  │  Email Notifications             ←──────────── Email Service │
     │  │  Token Cleanup/Validation        ←──────────── System     │    │
     │  │  Failed Login Tracking           ←──────────── System     │    │
     │  └─────────────────────────────────────────────────────────────┘    │
    └─────────────────────────────────────────────────────────────────────┘

Legend:
● = ADMIN only access
◯ = Both ADMIN and USER access
← = System/External actor initiated
```

---

## Detailed Use Cases

### 1. Authentication & Authorization Module

#### UC-01: User Login

- **Actors**: Admin, User
- **Description**: Users authenticate using email and password
- **Preconditions**: User has valid account
- **Flow**: Enter credentials → Validate → Generate JWT token → Return user profile
- **Extensions**: Failed login tracking, account lockout after 5 attempts

#### UC-02: User Registration

- **Actors**: Admin (only)
- **Description**: Admin creates new user accounts
- **Preconditions**: Admin authenticated
- **Flow**: Enter user details → Validate → Hash password → Create account → Send notification

#### UC-03: Password Management

- **Actors**: Admin, User
- **Description**: Users can change passwords or request reset
- **Flow**:
  - Change: Provide old/new password → Validate → Update
  - Reset: Request via email → Generate token → Reset with token

#### UC-04: User Account Management

- **Actors**: Admin (only)
- **Description**: Full CRUD operations on user accounts
- **Flow**: View users → Create/Edit/Delete → Manage roles → Monitor activity

### 2. Core Operations Module

#### UC-05: Ship Management (Navires)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Manage ship information and operations
- **Flow**: Register ship → Update details → Assign containers → Track status

#### UC-06: Container Management (Conteneurs)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Track containers and their assignments
- **Flow**: Register container → Assign to ship → Track location → Update status

#### UC-07: Port Call Management (Escales)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Manage ship arrivals and departures
- **Flow**: Schedule port call → Track arrival → Manage operations → Log departure

#### UC-08: Operation Tracking

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Monitor and record port operations
- **Flow**: Create operation → Assign resources → Track progress → Complete operation

### 3. Resource Management Module

#### UC-09: Team Management (Equipes)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Organize work teams and assignments
- **Flow**: Create team → Assign personnel → Schedule shifts → Monitor performance

#### UC-10: Personnel Management

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Manage staff information and assignments
- **Flow**: Register personnel → Assign to teams → Track availability → Manage schedules

#### UC-11: Equipment Management (Engins)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Track equipment usage and maintenance
- **Flow**: Register equipment → Schedule maintenance → Assign to operations → Monitor status

#### UC-12: Shift Management

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Plan and manage work shifts
- **Flow**: Create shift schedule → Assign personnel → Track attendance → Generate reports

#### UC-13: Subcontractor Management

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Manage external service providers
- **Flow**: Register subcontractor → Assign contracts → Monitor performance → Process payments

#### UC-14: Downtime Management (Arrets)

- **Actors**: Admin (CRUD), User (Read)
- **Description**: Track and manage system/equipment downtime
- **Flow**: Log downtime → Identify cause → Assign repair → Monitor resolution

### 4. Analytics & Reporting Module

#### UC-15: Dashboard Analytics

- **Actors**: Admin, User
- **Description**: View comprehensive system analytics
- **Flow**: Access dashboard → View metrics → Generate reports → Export data

#### UC-16: Summary Reports

- **Actors**: Admin, User
- **Description**: Generate summary reports on port activities
- **Flow**: Select criteria → Generate report → Review data → Export/Share

### 5. System Administration Module

#### UC-17: Performance Monitoring

- **Actors**: Admin (only)
- **Description**: Monitor system performance and health
- **Flow**: View metrics → Set alerts → Monitor trends → Take corrective action

#### UC-18: System Settings Management

- **Actors**: Admin (only)
- **Description**: Configure system parameters and preferences
- **Flow**: Access settings → Modify configuration → Validate changes → Apply updates

#### UC-19: Maintenance Operations

- **Actors**: Admin (only)
- **Description**: Perform system maintenance tasks
- **Flow**: Schedule maintenance → Execute operations → Verify results → Log activities

### 6. System Services (Automated)

#### UC-20: Auto Account Security

- **Actor**: System
- **Description**: Automatically manage account security
- **Flow**: Monitor login attempts → Lock accounts → Send alerts → Unlock expired locks

#### UC-21: Performance Monitoring Service

- **Actor**: System
- **Description**: Continuously monitor system performance
- **Flow**: Collect metrics → Analyze trends → Generate alerts → Clean old data

#### UC-22: Notification Service

- **Actor**: Email Service
- **Description**: Send automated notifications
- **Flow**: Trigger events → Generate notifications → Send emails → Log delivery status

---

## Security Matrix

| Use Case Category     | ADMIN Access     | USER Access                  | Authentication Required |
| --------------------- | ---------------- | ---------------------------- | ----------------------- |
| Authentication        | Full CRUD        | Login/Logout/Change Password | Varies                  |
| Core Operations       | Full CRUD        | Read Only                    | Yes                     |
| Resource Management   | Full CRUD        | Read Only                    | Yes                     |
| Analytics             | Full Access      | Read Access                  | Yes                     |
| System Administration | Full Access      | No Access                    | Yes                     |
| System Services       | No Direct Access | No Direct Access             | N/A                     |

---

## Technology Implementation

### Backend (Spring Boot)

- **Security**: JWT-based authentication with role-based authorization
- **API**: RESTful endpoints with CORS configuration
- **Database**: JPA/Hibernate with relational database
- **Monitoring**: Performance interceptors and health checks

### Frontend (React)

- **Authentication**: JWT token management
- **UI**: Role-based component rendering
- **API Communication**: Axios with request/response interceptors
- **State Management**: Context API for user state

### Integration Points

- **CORS**: Configured for localhost:3000 and production domains
- **Security**: PreAuthorize annotations for method-level security
- **Monitoring**: Performance interceptors for API endpoints
- **Notifications**: Email service integration for system alerts

This use case diagram represents a complete port management system with comprehensive functionality covering operational management, resource allocation, analytics, and system administration with appropriate security controls and automated services.
