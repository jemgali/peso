# PESO Portal

A comprehensive management system for the Public Employment Service Office (PESO), specifically designed to streamline the Special Program for Employment of Students (SPES). Built with a modern, high-performance tech stack focused on security, scalability, and developer experience.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Email/Password + Google OAuth)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS 4 + [Shadcn/UI](https://ui.shadcn.com/)
- **File Storage**: [UploadThing](https://uploadthing.com/)
- **Emails**: [Resend](https://resend.com/)
- **Time Management**: Standardized Manila Time (`Asia/Manila`)

---

## 🚀 Comprehensive Setup Guide

This guide walks you through setting up all required external services, environment configurations, and the local development environment.

### 1. Prerequisites

- **Node.js**: Version 20.x or higher
- **Package Manager**: `pnpm` (`npm install -g pnpm`)
- **Database**: A PostgreSQL instance (local or hosted, e.g., Supabase, Neon, or local Docker)
- **Domain Name** *(Optional for local dev, required for production)*

### 2. External Services Configuration

#### A. Database (PostgreSQL & Prisma)
1. Set up a PostgreSQL database.
2. The system uses two schemas: `auth` and `public`. Ensure your PostgreSQL user has permissions to create schemas.
3. Obtain your connection string (e.g., `postgresql://USER:PASSWORD@HOST:5432/DBNAME`).

#### B. Authentication (Better Auth)
1. Generate a random secret for sessions (e.g., using `openssl rand -base64 32`).
2. Set the Base URL of your application (e.g., `http://localhost:3000` for local or `https://yourdomain.com` for production).

#### C. Google Cloud Console (OAuth & Sheets)
**For Google OAuth (Login):**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Configure the **OAuth consent screen**.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID** (Web application).
5. Add Authorized Redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://yourdomain.com/api/auth/callback/google`
6. Save the **Client ID** and **Client Secret**.

**For Google Sheets (Reports Export):**
1. In the same project, enable the **Google Sheets API**.
2. Go to **Credentials** > **Create Credentials** > **Service Account**.
3. Create a JSON key for this Service Account and download it.
4. Open the JSON file to extract the `client_email` and `private_key`.
5. Create a new Google Sheet, and share it with the Service Account email.
6. Copy the **Spreadsheet ID** from the Google Sheet URL (the long string between `/d/` and `/edit`).

#### D. Email Services (Resend)
1. Create an account on [Resend](https://resend.com/).
2. For production, add and verify your **Domain** in the Resend dashboard to improve deliverability.
3. Generate an API Key.
4. Decide on an email sender address (e.g., `no-reply@yourdomain.com`).

#### E. File Storage (UploadThing)
1. Create an account on [UploadThing](https://uploadthing.com/).
2. Create a new App/Project.
3. Copy the **UploadThing Token**.

#### F. Domains & Deployment
If deploying to production:
1. Point your domain's DNS records to your hosting provider (e.g., Vercel or a VPS).
2. Ensure SSL/TLS is active.
3. Update Better Auth, Google OAuth, and UploadThing settings to use your production domain instead of `localhost`.

### 3. Environment Variables

Create a `.env` file in the root directory based on the services configured:

```bash
# Database
# Note: Ensure "?schema=public" is appended to standard connections
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000" # Update for production
BETTER_AUTH_SECRET="your_generated_secret"

# Resend (Emails)
RESEND_API_KEY="re_..."
EMAIL_FROM="PESO Portal <no-reply@yourdomain.com>"
ADMIN_EMAIL="admin@example.com" # Default admin seeder email
ADMIN_PASSWORD="secure_password" # Default admin seeder password

# UploadThing (File Storage)
UPLOADTHING_TOKEN="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID="..."
GOOGLE_SHEETS_CLIENT_EMAIL="..."
# Ensure line breaks in the private key are properly formatted with \n
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Installation & Database Initialization

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Initialize Database Schemas:**
   Connect to your database and create the required schemas if they do not exist:
   ```sql
   CREATE SCHEMA IF NOT EXISTS auth;
   CREATE SCHEMA IF NOT EXISTS public;
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

4. **Apply Migrations:**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Seed the Database:**
   This populates the system with initial configurations and the master admin account (using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`).
   ```bash
   pnpm prisma db seed
   ```

### 5. Start the Development Server

```bash
pnpm dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🏗 File System & Architecture

The application is structured to strictly separate concerns, enforcing a clean architecture between public views, protected portals, UI components, and business logic.

```text
peso/
├── prisma/                 # Database structure and migrations
│   ├── schema.prisma       # Prisma ORM models and schema definitions
│   └── seed.ts             # Database seeder for initial data & admin setup
├── public/                 # Static assets (images, fonts, raw PDFs for filling)
└── src/
    ├── app/                # Next.js App Router (Pages, Layouts, APIs)
    │   ├── api/            # API endpoints (Auth callbacks, Webhooks, Data fetching)
    │   ├── auth/           # Public pages for Sign In, Sign Up, and Verification
    │   ├── home/           # Landing page
    │   └── protected/      # Authenticated routes with RBAC logic
    │       ├── admin/      # Administrative dashboard (Evaluations, Reports, Batches)
    │       ├── client/     # Grantee portal (Application tracker, Document center)
    │       └── employee/   # Staff workspace for evaluating applicants
    │
    ├── components/         # Reusable React components
    │   ├── admin/          # Admin-specific UI blocks
    │   ├── client/         # Grantee-specific UI blocks
    │   ├── employee/       # Staff-specific UI blocks
    │   ├── email-template/ # React email components for Resend
    │   ├── forms/          # Form layouts and inputs using React Hook Form & Zod
    │   ├── shared/         # Cross-cutting components (Navigation, Layout wrappers)
    │   └── ui/             # Shadcn primitive components (Buttons, Inputs, Dialogs)
    │
    ├── lib/                # Core configurations, integrations, and utilities
    │   ├── auth.ts         # Better Auth initialization and configuration
    │   ├── prisma.ts       # Prisma Client singleton instantiation
    │   ├── email.ts        # Resend dispatch service logic
    │   ├── uploadthing.ts  # UploadThing core setup
    │   ├── google-sheets.ts# Google Sheets API integration
    │   ├── pdf-filler.ts   # Server-side PDF manipulation (`pdf-lib`)
    │   ├── validations/    # Zod validation schemas for forms and API payloads
    │   ├── types/          # Global TypeScript interfaces and types
    │   └── utils.ts        # Helper functions (class merging, date formatting)
    │
    └── hooks/              # Custom React hooks for client-side state management
```

### Module Use-Cases

- **`/src/app/protected`**: Enforces Role-Based Access Control (RBAC). It ensures that Grantees cannot access Admin panels, and Employees have restricted evaluation privileges.
- **`/src/components/ui`**: Acts as the design system foundation. Powered by Tailwind CSS and Shadcn, ensuring visual consistency without locking into a rigid component library.
- **`/src/lib`**: The backbone of the application. External service connections (DB, Emails, Storage, Auth) are initialized here to be reused throughout the application, keeping Next.js Server Actions and Route Handlers clean.