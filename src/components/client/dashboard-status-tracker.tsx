"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
  Send,
  Eye,
} from "lucide-react"
import type { ApplicationStatus } from "@/lib/validations/application-review"

interface StatusTrackerProps {
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
  latestReviewComments?: string | null
}

const TIMELINE_STEPS = [
  {
    key: "submitted",
    label: "Submitted",
    description: "Application submitted successfully",
    icon: Send,
  },
  {
    key: "in_review",
    label: "Under Review",
    description: "Being reviewed by administrator",
    icon: Eye,
  },
  {
    key: "decision",
    label: "Decision",
    description: "Final review decision",
    icon: CheckCircle2,
  },
]

function getActiveStep(status: ApplicationStatus): number {
  switch (status) {
    case "pending":
      return 0
    case "in_review":
      return 1
    case "approved":
    case "needs_revision":
    case "rejected":
      return 2
    default:
      return 0
  }
}

function getStatusBadge(status: ApplicationStatus) {
  const config: Record<
    ApplicationStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
  > = {
    pending: { label: "Pending", variant: "secondary" },
    in_review: { label: "Under Review", variant: "outline", className: "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400" },
    approved: { label: "Approved", variant: "default", className: "bg-green-600 hover:bg-green-700 text-white" },
    needs_revision: { label: "Needs Revision", variant: "outline", className: "border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400" },
    rejected: { label: "Rejected", variant: "destructive" },
  }

  const c = config[status]
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>
}

function getDecisionIcon(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="text-green-600 dark:text-green-400" />
    case "needs_revision":
      return <AlertTriangle className="text-orange-600 dark:text-orange-400" />
    case "rejected":
      return <XCircle className="text-red-600 dark:text-red-400" />
    default:
      return <CheckCircle2 />
  }
}

export default function DashboardStatusTracker({
  status,
  submittedAt,
  updatedAt,
  latestReviewComments,
}: StatusTrackerProps) {
  const activeStep = getActiveStep(status)

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">SPES Application</CardTitle>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Timeline */}
        <div className="flex flex-col gap-0">
          {TIMELINE_STEPS.map((step, index) => {
            const isActive = index <= activeStep
            const isCurrent = index === activeStep
            const StepIcon = index === 2 && activeStep >= 2
              ? () => getDecisionIcon(status)
              : step.icon

            return (
              <div key={step.key} className="flex gap-3">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                          ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon />
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`h-8 w-0.5 ${
                        index < activeStep ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Dates */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock />
              Submitted
            </span>
            <span>{new Date(submittedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock />
              Updated
            </span>
            <span>{new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Latest review comments */}
        {latestReviewComments && (
          <>
            <Separator />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium">Latest Review</p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {latestReviewComments}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/protected/client/application/status">
              View Full Details
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          {status === "needs_revision" && (
            <Button size="sm" asChild className="w-full">
              <Link href="/protected/client/application">
                <FileText data-icon="inline-start" />
                Edit & Resubmit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
