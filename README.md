# PESO Portal

Next.js (App Router) + TypeScript + Better Auth + Prisma (PostgreSQL).

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Prisma (client output: `generated/prisma`)
- PostgreSQL (`auth` + `public` schemas)
- Better Auth (email/password + Google)
- Resend (email verification)

## Requirements

- Node.js:
  - **Node 20+ recommended**
  - Note: Some dependencies (e.g., Resend) require modern Node versions.
- pnpm (recommended, repo includes `pnpm-lock.yaml`)

## 1) Install dependencies

```bash
pnpm install
```

## 2) Environment variables

Create a `.env` file in the repository root.

### Required

```bash
# Postgres connection string used by Prisma + Better Auth
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"

# Better Auth base URL (used by server + client)
BETTER_AUTH_URL="http://localhost:3000"

# Resend (used for email verification + /api/send test route)
RESEND_API_KEY="re_..."
```

### Optional (Google OAuth)

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 3) Database setup (PostgreSQL)

This project expects PostgreSQL and uses two schemas:

- `auth` (Better Auth tables/models)
- `public` (application domain tables/models)

Make sure your database exists and that these schemas are available.

Example (psql):

```sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;
```

## 4) Prisma: generate + migrate + seed

> Prisma client output is configured to `generated/prisma` and is gitignored.

### Run migrations

If you already have migrations, apply them:

```bash
pnpm prisma migrate dev
```

### Seed (creates initial admin)

Seeding is configured in `prisma.config.ts` to run:

```bash
pnpx tsx prisma/seed.ts
```

You can run seed via Prisma:

```bash
pnpm prisma db seed
```

The seed script will create an admin user if it does not already exist.

> Note: The current seed script uses a fixed admin email/password inside `prisma/seed.ts`. Change these before production use.

## 5) Run the app

```bash
pnpm dev
```

Open:

- http://localhost:3000

## Auth routes

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/verified` (success page after verification)

## Protected routes (role-based)

- `/protected/admin` (server-guarded; redirects if not admin)
- `/protected/client`
- `/protected/employee`

## API routes

- `POST /api/send`
  - Sends a sample email using Resend and a React email template
  - Source: `src/app/api/send/route.ts`

## Notes / gotchas

- The repo ignores `.env*` files—do not commit secrets.
- The generated Prisma client lives in `generated/prisma` (also ignored by git).
- Resend “from” domain in development uses `onboarding@resend.dev` in code; adjust for your real domain in production.
