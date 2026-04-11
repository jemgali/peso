# PESO Portal Setup Guide

Quick reference for new developers. For details, see SKILL.md.

## Prerequisites

- Node.js 20+ (`node --version`)
- pnpm 9+ (`pnpm --version`)
- PostgreSQL 14+ (local or Docker)

## First-Time Setup (5 minutes)

1. Clone and install:
   \`\`\`bash
   git clone https://github.com/jemgali/peso.git
   cd peso
   pnpm install
   \`\`\`

2. Set up environment:
   \`\`\`bash
   cp .env.example .env.local

   # Edit .env.local with your database URL, API keys

   \`\`\`

3. Database setup:
   \`\`\`bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   \`\`\`

4. Start development:
   \`\`\`bash
   pnpm dev
   # Open http://localhost:3000
   \`\`\`

## Default Test Credentials

After seeding:

- Email: `admin@example.com`
- Password: (check `prisma/seed.ts`)

## Environment Variables Checklist

- [ ] `DATABASE_URL` set to PostgreSQL connection
- [ ] `BETTER_AUTH_URL` set to `http://localhost:3000`
- [ ] `RESEND_API_KEY` set (or disable email in dev)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` optional

## Key Files to Know

| File                   | Purpose                     |
| ---------------------- | --------------------------- |
| `prisma/schema.prisma` | Database models             |
| `src/app`              | Next.js app routes          |
| `src/components/ui`    | shadcn/ui components        |
| `src/lib/auth.ts`      | Better Auth configuration   |
| `.env.local`           | Local environment variables |

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Check code quality
pnpm prisma studio   # Open Prisma GUI
pnpm prisma db push  # Sync schema to DB
```
