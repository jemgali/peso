# Common Issues & Solutions

## Database Issues

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Problem:** PostgreSQL not running
**Solution:**
\`\`\`bash

# Docker (recommended)

docker-compose -f docker-compose.dev.yml up -d

# Or if installed locally

brew services start postgresql
\`\`\`

### Error: "Database 'peso' does not exist"

**Problem:** Initial database not created
**Solution:**
\`\`\`bash
psql -U postgres -c "CREATE DATABASE peso;"
pnpm prisma migrate dev
\`\`\`

## Authentication Issues

### Error: "Invalid BETTER_AUTH_URL"

**Problem:** `.env` has wrong URL
**Solution:**
\`\`\`bash

# .env should have:

BETTER_AUTH_URL="http://localhost:3000" # local dev

# NOT: BETTER_AUTH_URL="http://peso.com"

\`\`\`

## Build Issues

### Error: "prisma generate failed"

**Problem:** Prisma client not generated
**Solution:**
\`\`\`bash
pnpm prisma generate
pnpm build
\`\`\`

### Error: "Cannot find module '@/components/ui/button'"

**Problem:** shadcn/ui component missing
**Solution:**
\`\`\`bash
pnpm dlx shadcn-ui@latest add button
\`\`\`

## Email Issues

### Error: "RESEND_API_KEY is missing"

**Problem:** Resend email key not set
**Solution:**

- If in development, comment out email sending in API route
- For production, get API key from resend.com

## TypeScript Issues

### Error: "Type 'User' is not assignable to type 'unknown'"

**Problem:** Prisma types not generated
**Solution:**
\`\`\`bash
pnpm prisma generate

# Then restart your IDE's TypeScript server

\`\`\`

## Got Stuck?

1. Check this troubleshooting guide
2. Search in `.github/skills/peso-fullstack-dev/SKILL.md`
3. Ask Copilot: `gh copilot explain "I'm getting error X"`
4. Check GitHub Issues
5. Ask the team
