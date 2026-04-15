# PESO System Refactor — Multi-Area Changes

Big refactor touching client dashboard, admin review, SPES form, and database.

## User Review Required

> [!IMPORTANT]
> Removing `profileRole` from `ProfileUser` — existing rows need migration. Will use `prisma migrate dev` which resets dev DB. Make sure no important data needs backup.

> [!WARNING]
> Address section — locking Province to "Benguet" and City to "Baguio City" means existing applications with other addresses keep old data. New apps restricted to Baguio only.

## Proposed Changes

### 1. Client Dashboard Refactor

#### [MODIFY] [page.tsx](file:///home/jemotski/Systems/peso/src/app/protected/client/page.tsx)
- Keep Cards (Active Applications, Status) and Status Tracker sidebar — no change
- Replace "Get Started" card with **Notifications Bar** — reuse notification fetch logic from `notification-bell.tsx`, display as inline list/bar on dashboard
- Replace `<DashboardAnnouncements />` with **Announcements Calendar** — new component

#### [NEW] dashboard-notifications.tsx
- `src/components/client/dashboard-notifications.tsx`
- Inline notification bar (replicates header notification bell content)
- Fetch from `/api/notifications`, show list with read/unread states, mark-as-read

#### [NEW] dashboard-calendar.tsx
- `src/components/client/dashboard-calendar.tsx`
- Calendar view using existing `@/ui/calendar` (shadcn)
- Fetch announcements from `/api/client/announcements`
- Highlight dates with announcements via dot indicators
- onClick date with announcement → popup/dialog with announcement details

#### [DELETE / UNUSED] dashboard-announcements.tsx
- `src/components/client/dashboard-announcements.tsx` — replaced by calendar

---

### 2. Admin Application Review Refactor

#### [MODIFY] [page.tsx](file:///home/jemotski/Systems/peso/src/app/protected/admin/applications/%5Bid%5D/page.tsx)
- Remove 4-tab layout (Application, Field Review, Documents, Submit)
- Replace with 2-tab layout: **Application Review** | **Documents & Verification**
- Tab 1: Merged ApplicationViewer + ReviewForm — show field data with inline check/cross/comment next to each label
- Tab 2: Merged document viewing (from ApplicationViewer) + DocumentReview feedback
- After submit: show editable status dropdown instead of redirecting away

#### [MODIFY] [application-viewer.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/application-viewer.tsx)
- Redesign `Field` component: `Label [✓] [✗] [💬]` then `Value` below
- Accept `fieldFeedback` + `onFieldFeedbackChange` props to embed review inline
- Remove Documents section (moved to DocumentReview tab)

#### [MODIFY] [review-form.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/review-form.tsx)
- May become unused or significantly reduced — logic moves into ApplicationViewer

#### [MODIFY] [document-review.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/document-review.tsx)
- Add document viewing (file links, preview) from ApplicationViewer's Documents section
- Each doc: view link + Valid/Invalid/Missing buttons + comment

#### [MODIFY] [review-submit.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/review-submit.tsx)
- After successful submit: stay on page, show status editor dropdown
- Admin can change status post-decision

#### [NEW] status-editor API route
- `src/app/api/admin/applications/[id]/status/route.ts`
- PATCH endpoint to update `ApplicationSubmission.status` directly

---

### 3. SPES Application Form Changes

#### [MODIFY] [address-section.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/sections/address-section.tsx)
- Set Province="Benguet", City="Baguio City" as defaults
- Disable province and city fields (readonly, pre-filled)
- Only barangay remains selectable

#### [MODIFY] [spes-application-form.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/spes-application-form.tsx)
- After successful submit → `router.push("/protected/client")` instead of staying on review

#### [MODIFY] [documents-section.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/sections/documents-section.tsx)
- Add "View Sample" button per document type
- Show sample dialog/popup with example image of expected document
- Require all required documents before allowing "Next" — validate in `handleNext`
- Block section navigation if required docs missing

#### [MODIFY] [skills-section.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/sections/skills-section.tsx)
- Replace free-text input with dropdown using `/public/data/skills-list.json`
- Multi-select dropdown for skills
- If "Others" selected → show text input for custom skill

#### [MODIFY] [basic-info-section.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/sections/basic-info-section.tsx)
- Replace religion text field with dropdown using `/public/data/religion-list.json`
- If "Others" selected → show text input for custom religion

---

### 4. Database Changes

#### [MODIFY] [schema.prisma](file:///home/jemotski/Systems/peso/prisma/schema.prisma)
- Remove `profileRole` field from `ProfileUser` model

#### Cascading `profileRole` removal across codebase:
- [auth.ts](file:///home/jemotski/Systems/peso/src/lib/auth.ts) — remove `profileRole` from profile creation
- [route.ts](file:///home/jemotski/Systems/peso/src/app/api/client/application/route.ts) — remove `profileRole` from create/update
- [route.ts](file:///home/jemotski/Systems/peso/src/app/api/client/profile-setup/route.ts) — remove `profileRole` from create/update
- [route.ts](file:///home/jemotski/Systems/peso/src/app/api/admin/applications/%5Bid%5D/route.ts) — remove from response mapping
- [spes-application.ts](file:///home/jemotski/Systems/peso/src/lib/validations/spes-application.ts) — remove from schema
- [application-review.ts](file:///home/jemotski/Systems/peso/src/lib/validations/application-review.ts) — remove from types
- [spes-application-form.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/spes-application-form.tsx) — remove default value
- [review-section.tsx](file:///home/jemotski/Systems/peso/src/components/forms/client/sections/review-section.tsx) — remove role display
- [review-form.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/review-form.tsx) — remove from fields
- [application-viewer.tsx](file:///home/jemotski/Systems/peso/src/components/admin/review/application-viewer.tsx) — remove role field
- [application/page.tsx](file:///home/jemotski/Systems/peso/src/app/protected/client/application/page.tsx) — remove from defaults
- [feedback-display.tsx](file:///home/jemotski/Systems/peso/src/components/client/feedback-display.tsx) — remove role mapping

---

## Verification Plan

### Automated Tests
- `npx prisma migrate dev` — verify schema migration succeeds
- `npm run build` — verify no TypeScript errors after all changes
- Manual browser test: client dashboard shows notifications bar + calendar
- Manual browser test: admin review page shows merged view with inline feedback
- Manual browser test: SPES form address locked to Baguio, religion/skills dropdowns work, docs require uploads

### Manual Verification
- Submit test application → verify redirect to dashboard
- Admin review → verify inline field feedback works
- Admin submit review → verify can edit status after
- Verify "View Sample" buttons show document examples
