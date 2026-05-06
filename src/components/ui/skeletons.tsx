import React from "react";
import { Card } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

// Skeleton for application list table
export function ApplicationsListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 flex-1 max-w-xs" />
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {/* Table header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for application detail view
export function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Status bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </Card>

      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for client status page
export function ApplicationStatusSkeleton() {
  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for dashboard cards
export function DashboardCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </Card>
  );
}

// Skeleton for notification list
export function NotificationListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for document cards
export function DocumentCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
}

// Skeleton for review form sections
export function ReviewFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for users list table
export function UsersListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Search and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Table header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for programs list table
export function ProgramsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Search and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Table header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-7 gap-4 items-center">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <Skeleton className="h-4 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for announcements grid
export function AnnouncementsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full max-w-sm" />

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton for schedule calendar
export function ScheduleCalendarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8" />
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Skeleton for client dashboard page
export function ClientDashboardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left content */}
        <div className="flex min-h-0 flex-col gap-4">
          {/* Top cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="size-5" />
                  </div>
                  <Skeleton className="h-9 w-12" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </Card>
            ))}
          </div>

          {/* Calendar skeleton */}
          <Card className="flex-1">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:block">
          <Card className="h-fit">
            <div className="p-6 flex flex-col gap-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 flex flex-col gap-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton for profile settings page
export function ProfileFormSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full py-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-5 w-72" />
      </div>

      <Card>
        {/* Card header */}
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="p-6 flex flex-col gap-6">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* More fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* More fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-6 border-t">
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Skeleton for evaluation page
export function EvaluationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main table area */}
        <Card className="lg:col-span-2 p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Skeleton className="h-10 flex-1 md:max-w-sm" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-10 w-[140px]" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-7 w-44 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="border-b bg-muted/50 p-3">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b p-3 last:border-b-0">
                <div className="flex gap-4 items-center">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton for remarks table
export function RemarksTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Card className="p-6">
        {/* Search */}
        <Skeleton className="h-10 w-full md:max-w-sm mb-4" />

        {/* Table */}
        <div className="rounded-md border">
          <div className="border-b bg-muted/50 p-3">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b p-3 last:border-b-0">
              <div className="flex gap-4 items-center">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-8 w-24 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Skeleton for batch management
export function BatchManagementSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main table area */}
        <Card className="lg:col-span-2">
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="px-6 pb-6">
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
              <Skeleton className="h-10 w-36" />
            </div>

            {/* Badges */}
            <div className="mb-4 flex gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <div className="border-b bg-muted/50 p-3">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b p-3 last:border-b-0">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />

            <div className="flex flex-col gap-3 mt-4">
              <Skeleton className="h-5 w-36" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Skeleton for application period settings (inline)
export function ApplicationPeriodSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-5" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="size-5" />
        </div>
      </div>
    </div>
  );
}
