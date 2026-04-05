# PESO - Copilot Instructions

This is a Next.js 16 web application for managing PESO (Public Employment Service Office) operations, including user management, applications, programs, and scheduling.

## Build, Test, and Lint Commands

### Development

```bash
pnpm dev          # Start development server on http://localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database

```bash
pnpx prisma migrate dev        # Run migrations in development
pnpx prisma migrate deploy     # Run migrations in production
pnpx prisma studio             # Open Prisma Studio
pnpx tsx prisma/seed.ts        # Seed database
pnpx prisma generate           # Regenerate Prisma client
```

## Architecture

### Stack

- **Framework**: Next.js 16 with App Router (React 19)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth with email/password and Google OAuth
- **UI Components**: shadcn/ui (radix-nova style) with Tailwind CSS v4
- **Email**: Resend for transactional emails
- **Password Hashing**: @node-rs/argon2
- **Forms**: react-hook-form with Zod validation

### Directory Structure

```
src/
  app/                      # Next.js App Router pages
    api/                    # API routes
    auth/                   # Public auth pages (sign-in, sign-up, verified)
    protected/              # Protected routes by role
      admin/                # Admin-only pages
      client/               # Client-only pages
      employee/             # Employee-only pages
  components/
    admin/                  # Admin-specific components
    auth/                   # Auth-related components
    client/                 # Client-specific components
    email-template/         # Email templates
    forms/                  # Form components
    protected/              # Shared protected components (header, footer)
    public/                 # Public components
    ui/                     # shadcn/ui components
  lib/
    auth.ts                 # better-auth configuration
    auth-client.ts          # Client-side auth utilities
    password.ts             # Password hashing utilities
    prisma.ts               # Prisma client singleton
    utils/                  # Utility modules
      admin-auth.ts         # Server-side admin auth guard
      user-auth.ts          # Server-side user auth guard
    utils.ts                # cn() utility for Tailwind
  hooks/                    # React hooks
prisma/
  schema.prisma             # Database schema with auth and public schemas
  migrations/               # Migration files
  seed.ts                   # Database seeding script
generated/
  prisma/                   # Generated Prisma client (custom output path)
```

### Authentication Flow

- Uses better-auth with Prisma adapter
- Email verification required for new sign-ups
- Supports email/password and Google OAuth
- Sessions stored in PostgreSQL
- Custom password hashing using argon2
- Role-based access control (admin, employee, client)

### Database Schema

- **Two PostgreSQL schemas**: `auth` (authentication) and `public` (application data)
- **Auth models**: User, Session, Account, Verification
- **Profile models**: ProfileUser, ProfilePersonal
- All auth relationships cascade on delete
- Custom Prisma client output: `generated/prisma`

### Role-Based Authorization

- Protected routes use server-side auth guards
- `requireAdmin()` in `/lib/utils/admin-auth.ts` - redirects non-admins
- `requireUser()` in `/lib/utils/user-auth.ts` - redirects unauthenticated users
- Role field on User model determines access level
- Each role has its own layout and page structure in `app/protected/`

## Key Conventions

### Path Aliases

Defined in `tsconfig.json`:

- `@/*` → `src/*`
- `@/prisma/*` → `prisma/*`
- `@/generated/*` → `generated/*`
- `@/public/*` → `src/components/public/*`
- `@/ui/*` → `src/components/ui/*`
- `@/forms/*` → `src/components/forms/*`
- `@/protected/*` → `src/components/protected/*`
- `@/email-template/*` → `src/components/email-template/*`

### Styling

- Use `cn()` utility from `@/lib/utils` for conditional Tailwind classes
- shadcn/ui components follow radix-nova style preset
- Tailwind CSS v4 with PostCSS
- CSS variables for theming (see `globals.css`)

### Prisma Client

- Import from `@/generated/prisma/client`, NOT `@prisma/client`
- Use the singleton from `@/lib/prisma.ts` to prevent multiple instances
- Schema uses multi-schema setup (auth + public)
- Better-auth adapter configured with PostgreSQL provider

### Authentication in Components

- Server Components: Use `auth.api.getSession({ headers })` from `@/lib/auth`
- Client Components: Use auth hooks from `@/lib/auth-client`
- Protected layouts: Call `requireAdmin()` or `requireUser()` at layout level
- Session contains user object with role, email, name, etc.

### Forms and Validation

- Use react-hook-form with Zod schemas
- Form components in `src/components/forms/`
- Better-auth handles email verification automatically

### Email

- Resend configured in `@/lib/auth`
- Email templates in `src/components/email-template/`
- Sender: "PESO <noreply@jemgali.tech>"

### Environment Variables

Required in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_URL` - Base URL for better-auth
- `RESEND_API_KEY` - Resend API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (if using OAuth)
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret (if using OAuth)

### React Compiler

- React compiler enabled in `next.config.ts`
- Uses babel-plugin-react-compiler for optimization

### Component Organization

- Components are organized by access level (public, protected, admin, client)
- Shared UI components in `src/components/ui/` (shadcn/ui)
- Role-specific components in their respective folders
- Protected components (header, footer) shared across authenticated views

# Package Manager Rules

- Always use `pnpm` as the package manager.
- Never suggest `npm` or `yarn` commands.
- Output `pnpm add`, `pnpm run`, `pnpm install`, or `pnpm exec` as appropriate.
