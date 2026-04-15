# Task Checklist

## 1. Database — Remove profileRole
- [ ] Remove `profileRole` from `schema.prisma`
- [ ] Run `pnpm prisma migrate dev`
- [ ] Remove from `auth.ts`
- [ ] Remove from `api/client/application/route.ts`
- [ ] Remove from `api/client/profile-setup/route.ts`
- [ ] Remove from `api/admin/applications/[id]/route.ts`
- [ ] Remove from `spes-application.ts` validation
- [ ] Remove from `application-review.ts` types
- [ ] Remove from `spes-application-form.tsx`
- [ ] Remove from `review-section.tsx`
- [ ] Remove from `review-form.tsx`
- [ ] Remove from `application-viewer.tsx`
- [ ] Remove from `application/page.tsx`
- [ ] Remove from `feedback-display.tsx`

## 2. SPES Form Changes
- [ ] Address section — lock province/city to Benguet/Baguio
- [ ] Skills section — dropdown from skills-list.json with Others
- [ ] Basic info — religion dropdown from religion-list.json with Others
- [ ] Documents section — view sample buttons + require required docs
- [ ] Submit redirect to dashboard
- [ ] Documents validation in form navigation

## 3. Client Dashboard
- [ ] New dashboard-notifications component
- [ ] New dashboard-calendar component
- [ ] Update dashboard page.tsx

## 4. Admin Review Refactor
- [ ] Merge ApplicationViewer + ReviewForm (inline feedback)
- [ ] Move docs to DocumentReview tab
- [ ] 3-tab layout (Application Review, Documents, Submit)
- [ ] Status editor in applications table
- [ ] Status PATCH API endpoint
- [ ] After submit → redirect to applications list (existing behavior ok)

## 5. Verify
- [ ] `pnpm run build` passes
