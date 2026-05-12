# PESO Portal

A comprehensive management system for the Public Employment Service Office (PESO), specifically designed to streamline the Special Program for Employment of Students (SPES). Built with a modern, high-performance tech stack focused on security, scalability, and developer experience.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Email/Password + Google OAuth)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: Tailwind CSS 4 + [Shadcn/UI](https://ui.shadcn.com/)
- **File Storage**: [UploadThing](https://uploadthing.com/)
- **Emails**: [Resend](https://resend.com/)
- **Time Management**: Standardized Manila Time (`Asia/Manila`)

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: Version 20.x or higher is required.
- **Package Manager**: `pnpm` is highly recommended.
- **Database**: A PostgreSQL instance (local or hosted).

### 2. Environment Setup

Create a `.env` file in the root directory and populate it with the following:

```bash
# Database
# Note: The system requires "auth" and "public" schemas.
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-generate-secret-here"

# Resend (Emails)
RESEND_API_KEY="re_..."

# UploadThing (File Storage)
UPLOADTHING_TOKEN="..."

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Sheets Export (Optional - for Reports)
GOOGLE_SHEETS_SPREADSHEET_ID="..."
GOOGLE_SHEETS_CLIENT_EMAIL="..."
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Installation

```bash
pnpm install
```

### 4. Database Initialization

The project uses two schemas: `auth` for authentication tables and `public` for the application logic.

1.  **Create Schemas** (if not done automatically):
    ```sql
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE SCHEMA IF NOT EXISTS public;
    ```

2.  **Generate Prisma Client**:
    ```bash
    pnpm prisma generate
    ```

3.  **Apply Migrations**:
    ```bash
    pnpm prisma migrate dev
    ```

4.  **Seed Initial Data**:
    This creates the initial administrative account and system settings.
    ```bash
    pnpm prisma db seed
    ```

### 5. Run Development Server

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🏗 Project Structure & Modules

- **`/auth`**: Public routes for sign-in, sign-up, and email verification.
- **`/protected/admin`**: Administrative dashboard.
  - **Announcements & Schedule**: Manage system-wide events and notices.
  - **Applications**: Multi-stage review process (New vs. SPES Baby).
  - **Evaluation**: Scoring and remarks for grantees.
  - **Batches**: Management of SPES work periods and office assignments.
  - **Users**: RBAC (Role-Based Access Control) management.
- **`/protected/client`**: Grantee/Applicant portal.
  - **Application Tracker**: Real-time status updates on submissions.
  - **Document Center**: Upload and manage required SPES documents.
- **`/protected/employee`**: Staff-level portal (in development).

---

## 📋 Roadmap & Project Status

### System Modules Status

| Module | Status | Features |
| :--- | :--- | :--- |
| **Authentication** | ✅ Complete | Email/Password, Google OAuth, Role-based access (RBAC). |
| **Applications** | ✅ Complete | New/SPES Baby workflows, status tracking, admin review. |
| **Evaluation** | ✅ Complete | Multi-criteria scoring, remarks, violation tracking, file uploads. |
| **Batches** | ✅ Complete | Batch creation, year filtering, office assignments. |
| **Reports** | ✅ Complete | Data visualization (Recharts), Google Sheets export. |
| **Notify** | ✅ Complete | Bulk applicant selection, calendar events, email integration. |
| **Schedule** | ✅ Complete | Unified event management, Manila timezone support. |
| **Grantee Portal** | 🚧 Beta | Application tracker, Document center, PDF generation. |
| **Employee Portal** | ✅ Complete | Restricted workspace for non-admin evaluators. |
| **Audit Logs** | ✅ Complete | Full administrative action history with diff tracking. |

---

### 🚀 Planned Enhancements

#### 1. Administrative Features
- [x] **Real-time Admin Alerts**: Live notifications (toasts) when critical events occur.
- [x] **Advanced Audit Logging**: Track all administrative changes with detailed history.
- [x] **Batch UX Refinement**: Replaced "Bulk Control" with "Status Control" for clarity.
- [x] **Standardized Naming**: Enforced strict ALL-CAPS naming for batch identifiers.

#### 2. Grantee Portal
- [x] **Automated Form Generation**: Server-side PDF filling (`pdf-lib`) for SPES forms.
- [ ] **Document Printing Redesign**: Modernize the print view to match the dashboard aesthetic.

#### 3. Employee Workflow
- [x] **Employee Portal Implementation**: Dedicated workspace for non-admin evaluators.

#### 4. System Standards
- [x] **Strict Manila Time**: Audited all components for `manila-datetime` compliance.
- [x] **Standard Date Format**: Enforced `{mm/dd/yyyy}` globally in administrative UI.

#### 5. Advanced Infrastructure
- [ ] **Production Hardening**: SSL/TLS finalization and SSH security audits.

---

## 📝 Notes
- Prisma client is generated into `generated/prisma` to keep the root clean.
- Ensure `DATABASE_URL` includes `?schema=public` for standard Prisma behavior while supporting multiple schemas.