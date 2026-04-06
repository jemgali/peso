# SKILLS.md - PESO Portal Development Guide

PESO Portal: Next.js 16 + React 19 + TypeScript + Better Auth + Prisma + PostgreSQL

---

## 📋 Project Structure

```
peso/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global CSS styles
│   │   ├── loading.tsx               # Loading UI
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...all]/        # Better Auth handler
│   │   │   └── send/                 # Email template test route
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   └── verified/page.tsx
│   │   └── protected/                # Role-based protected routes
│   │       ├── admin/page.tsx
│   │       ├── client/page.tsx
│   │       └── employee/page.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (auto-generated)
│   │   ├── forms/                    # React Hook Form + Zod components
│   │   ├── public/                   # Public page components
│   │   ├── protected/                # Protected route components
│   │   ├── admin/                    # Admin-specific components
│   │   └── email-template/           # React Email templates for Resend
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-active-path.ts
│   │   └── use-mobile.ts
│   ├── lib/                          # Utilities and helpers
│   │   ├── auth.ts                   # Better Auth server configuration
│   │   ├── auth-client.ts            # Better Auth client configuration
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── password.ts               # Password utilities
│   │   ├── utils.ts                  # General utility functions
│   │   ├── api/                      # API helper functions
│   │   └── utils/                    # Additional utility modules
│   └── middleware.ts                 # Next.js middleware (auth checks)
├── prisma/
│   ├── schema.prisma                 # Data models (auth + public schemas)
│   ├── seed.ts                       # Database seeding script
│   └── migrations/                   # Database migration history
├── generated/
│   └── prisma/                       # Auto-generated Prisma client (gitignored)
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── prisma.config.ts                  # Prisma seed configuration
└── SKILLS.md                         # This file
```

---

## 🚀 Quick Start Commands

### Development
```bash
pnpm install                          # Install dependencies
pnpm dev                              # Start Next.js dev server (http://localhost:3000)
pnpm build                            # Build for production
pnpm start                            # Start production server
```

### Database
```bash
pnpm prisma generate                  # Generate Prisma client (output: generated/prisma)
pnpm prisma migrate dev               # Create and apply migrations
pnpm prisma db seed                   # Seed database with initial admin user
pnpm prisma studio                    # Open Prisma Studio GUI
```

### Code Quality
```bash
pnpm lint                             # Run ESLint (Next.js config)
```

---

## 🔑 Environment Setup

### Create `.env` file in project root:

```bash
# PostgreSQL connection (Prisma + Better Auth)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/peso?schema=public"

# Better Auth configuration
BETTER_AUTH_URL="http://localhost:3000"

# Email service (Resend)
RESEND_API_KEY="re_..."

# Optional: Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

> **Important:** Never commit `.env` or `.env.*` files. They are gitignored.

---

## 🏗️ Tech Stack Details

### Frontend
- **Framework:** Next.js 16 (App Router, React Server Components)
- **React:** React 19 (latest)
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS 4 (with PostCSS)
- **UI Components:** shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **Tables:** TanStack React Table
- **Notifications:** Sonner (toast notifications)
- **Theme:** next-themes (dark/light mode)
- **Command Palette:** cmdk
- **Carousel:** Embla Carousel
- **Date Picker:** React Day Picker

### Backend
- **Runtime:** Node.js 20+ (required for Resend compatibility)
- **Package Manager:** pnpm
- **Database:** PostgreSQL (two schemas: `auth` + `public`)
- **ORM:** Prisma 7 (with adapter-pg)
- **Auth:** Better Auth (email/password + Google OAuth)
- **Email:** Resend (transactional emails + React templates)
- **Password Hashing:** @node-rs/argon2
- **Validation:** Zod
- **Email OTP:** input-otp

### Development
- **TypeScript:** Strict mode, ES2023 target
- **Linter:** ESLint 9 (Next.js config)
- **Runtime:** tsx (TypeScript execution for scripts)
- **React Compiler:** Babel plugin (experimental)

---

## 🗄️ Database Schema

### Two PostgreSQL Schemas:

**`auth` schema** (Better Auth — do not modify directly)
| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `auth.user` | User accounts (id, name, email, role, banned) |
| `Session` | `auth.session` | Active sessions with token + expiry |
| `Account` | `auth.account` | OAuth provider accounts |
| `Verification` | `auth.verification` | Email verification tokens |

**`public` schema** (Application domain)
| Model | Table | Purpose |
|-------|-------|---------|
| `ProfileUser` | `public.profile_user` | Extended user profile (name, role) |
| `ProfilePersonal` | `public.profile_personal` | Personal details (birthdate, sex, contact) |

### Relationships
```
User (auth) ──── ProfileUser (public) ──── ProfilePersonal (public)
```

### Prisma Client Configuration
- **Output Location:** `generated/prisma` (not committed to git)
- **Adapter:** @prisma/adapter-pg
- **Migrations:** Stored in `prisma/migrations/`

### Database Setup
```sql
-- Create required schemas before running migrations
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;
```

---

## 🔐 Authentication

### Better Auth Integration
- **Server config:** `src/lib/auth.ts`
- **Client config:** `src/lib/auth-client.ts`
- **API handler:** `src/app/api/auth/[...all]/route.ts`

### Auth Pages
| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Email/password sign-in |
| `/auth/sign-up` | Registration with email verification |
| `/auth/verified` | Email verification success page |

### Protected Routes (Role-Based)
| Route | Required Role |
|-------|--------------|
| `/protected/admin` | admin |
| `/protected/client` | client |
| `/protected/employee` | employee |

### Providers
- Email/Password (built-in, password hashed with argon2)
- Google OAuth (requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)

### Client Usage
```typescript
import { authClient } from "@/lib/auth-client";

// Sign in
await authClient.signIn.email({ email, password });

// Sign out
await authClient.signOut();

// Get session
const { data: session } = await authClient.getSession();
```

---

## 📧 Email & Notifications

### Resend Integration
- **Service:** Resend API for transactional emails
- **Templates:** React components in `src/components/email-template/`
- **Test Endpoint:** `POST /api/send` (development)
- **From Domain:** `onboarding@resend.dev` (development only — change for production)

### Email Verification Flow
1. User registers → receives OTP email via Resend
2. User enters OTP (using `input-otp` component)
3. Redirected to `/auth/verified` on success

### Toast Notifications (Sonner)
```typescript
import { toast } from "sonner";

toast.success("Profile updated!");
toast.error("Something went wrong.");
toast.loading("Saving...");
```

---

## 🎨 UI & Styling

### Tailwind CSS 4
- PostCSS 4 support
- `tw-animate-css` for animation utilities
- Theme configuration in `tailwind.config.ts`

### shadcn/ui Components
- Located in `src/components/ui/` (auto-generated)
- Based on Radix UI primitives
- Full TypeScript support

### Adding New shadcn/ui Components
```bash
npx shadcn@latest add <component-name>
# Examples:
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add data-table
```

### Component Architecture
```
src/components/
├── ui/               # Base UI components (button, input, dialog, etc.)
├── forms/            # Form-specific components (wrapped with React Hook Form)
├── public/           # Public page components (no auth required)
├── protected/        # Protected page components (auth required)
├── admin/            # Admin dashboard components (side-nav, content areas)
├── email-template/   # Email template components (React Email for Resend)
```

### Path Aliases for Component Imports
```typescript
import { Button } from "@/ui/button";
import { LoginForm } from "@/forms/login";
```

---

## 📝 Forms & Validation

### React Hook Form + Zod Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});
type FormData = z.infer<typeof schema>;

// 2. Use in component
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

// 3. Handle submission
const onSubmit = async (data: FormData) => {
  // API call → toast notification
};
```

### Common Form Patterns
- Form submission → validation → API call → `toast.success()` or `toast.error()`
- Error display via `form.formState.errors`
- Loading state: `form.formState.isSubmitting`
- Field registration: `{...form.register("fieldName")}`

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Update `.env` with production secrets (new `BETTER_AUTH_SECRET`, production `DATABASE_URL`)
- [ ] Change `BETTER_AUTH_URL` to production domain
- [ ] Change Resend "from" domain from `onboarding@resend.dev` to your verified domain
- [ ] Run database migrations: `pnpm prisma migrate deploy`
- [ ] Build and verify: `pnpm build && pnpm start`
- [ ] Update seed script admin credentials before running in production
- [ ] Ensure Node.js 20+ in deployment environment

### Build Output
- Default SSR: `.next/` directory
- Environment variables must be set before `pnpm build`

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Prisma client not found | Run `pnpm prisma generate` to output client to `generated/prisma` |
| Database connection refused | Verify `DATABASE_URL` in `.env` and ensure PostgreSQL is running |
| Missing `auth`/`public` schema | Run `CREATE SCHEMA IF NOT EXISTS auth;` in PostgreSQL |
| Email verification not working | Check `RESEND_API_KEY` is valid; verify sender domain in Resend dashboard |
| Google OAuth fails | Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env` |
| Node.js version error | Upgrade to Node.js 20+ (Resend and other deps require it) |
| `pnpm install` fails | Delete `node_modules/` and `pnpm-lock.yaml`, then re-run `pnpm install` |
| Type errors after schema change | Run `pnpm prisma generate` to regenerate types |

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout; wraps app with theme + session providers |
| `src/middleware.ts` | Next.js middleware for route protection and auth redirects |
| `src/lib/auth.ts` | Better Auth server configuration (providers, session, plugins) |
| `src/lib/auth-client.ts` | Better Auth browser client (used in client components) |
| `src/lib/prisma.ts` | Prisma client singleton with pg adapter |
| `prisma/schema.prisma` | All data models and schema definitions |
| `prisma/seed.ts` | Seeds initial admin user (run with `pnpm prisma db seed`) |
| `tsconfig.json` | TypeScript config with path aliases |
| `tailwind.config.ts` | Tailwind CSS theme and plugin configuration |
| `components.json` | shadcn/ui CLI configuration |
| `eslint.config.mjs` | ESLint rules (Next.js flat config) |
| `prisma.config.ts` | Prisma seed script configuration |

---

## 📖 Path Aliases

Configured in `tsconfig.json`:

| Alias | Maps To |
|-------|---------|
| `@/*` | `src/*` |
| `@/ui/*` | `src/components/ui/*` |
| `@/forms/*` | `src/components/forms/*` |
| `@/public/*` | `src/components/public/*` |
| `@/protected/*` | `src/components/protected/*` |
| `@/email-template/*` | `src/components/email-template/*` |
| `@/prisma/*` | `prisma/*` |
| `@/generated/*` | `generated/*` |

### Example Usage
```typescript
import { Button } from "@/ui/button";
import { LoginForm } from "@/forms/login-form";
import { prisma } from "@/lib/prisma";
import type { ProfileUser } from "@/generated/prisma";
```

---

## 🔄 Development Workflow

### Creating a New Page
```
1. Create: src/app/[route]/page.tsx
2. Add layout if needed: src/app/[route]/layout.tsx
3. Style using Tailwind + shadcn/ui components
4. Add auth check in middleware.ts if protected
```

### Creating a New Protected Page (Role-Based)
```
1. Create: src/app/protected/[role]/page.tsx
2. Add route protection in src/middleware.ts
3. Create components in src/components/protected/
```

### Adding a Database Model
```
1. Edit prisma/schema.prisma — add model in public schema
2. Run: pnpm prisma migrate dev --name add-model-name
3. Run: pnpm prisma generate (auto-updates types)
4. Import types: import type { YourModel } from "@/generated/prisma"
```

### Adding a New API Route
```typescript
// src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const data = await prisma.yourModel.findMany();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // validate with Zod, then save
  return NextResponse.json({ success: true });
}
```

### Adding UI Components
```bash
# Add a new shadcn/ui component
npx shadcn@latest add <component-name>
# Component is added to src/components/ui/
# Import with: import { ComponentName } from "@/ui/component-name"
```

---

## 💡 Copilot CLI Tips

Use these prompts to get context-aware help:

```bash
# Explain project concepts
gh copilot explain "How do I add a new protected route for a new role?"
gh copilot explain "How do I add a new field to the ProfileUser model?"
gh copilot explain "How do I send a transactional email with Resend?"
gh copilot explain "How does Better Auth handle email verification?"

# Suggest code
gh copilot suggest "Create a form component for updating user profile"
gh copilot suggest "Add a new Prisma model for job listings in the public schema"
gh copilot suggest "Create a Next.js API route that returns paginated results"
gh copilot suggest "Create a shadcn/ui data table for displaying job applicants"
```

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Zod Documentation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [TanStack Table](https://tanstack.com/table/latest)
- [Sonner (Toasts)](https://sonner.emilkowal.ski)

---

## 📝 Notes

- **TypeScript Strict Mode:** All code must pass strict type checking. Avoid `any` types.
- **pnpm:** Use `pnpm` (not `npm` or `yarn`) for all package management.
- **Server Components:** Prefer React Server Components for data fetching where possible. Use `"use client"` only when necessary (event handlers, hooks, browser APIs).
- **Database Schemas:** Maintain strict separation between `auth` (Better Auth managed) and `public` (application domain).
- **Gitignored Files:** `.env*`, `node_modules/`, `.next/`, `generated/prisma/`, `dist/`
- **No Test Suite Yet:** Unit/E2E tests are not yet configured. Recommended future stack: Vitest + Playwright.
