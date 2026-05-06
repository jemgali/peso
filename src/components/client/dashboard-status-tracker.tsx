"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
  Send,
  Eye,
  UserCheck,
  Layers,
  Building2,
  Search,
} from "lucide-react"
import type { ApplicationStatus } from "@/lib/validations/application-review"

interface StatusTrackerProps {
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
  latestReviewComments?: string | null
  isGrantee?: boolean
  batchName?: string | null
  assignedOffice?: string | null
}

const TIMELINE_STEPS = [
  {
    key: "under_review",
    label: "Under Review",
    description: "Application is being reviewed",
    icon: Search,
  },
  {
    key: "application_status",
    label: "Application Status",
    description: "Final review decision",
    icon: FileText,
  },
  {
    key: "grantee",
    label: "Grantee",
    description: "Official SPES Grantee",
    icon: UserCheck,
  },
  {
    key: "batch",
    label: "Batch",
    description: "Assigned Batch",
    icon: Layers,
  },
  {
    key: "office",
    label: "Office",
    description: "Assigned Office",
    icon: Building2,
  },
]

function getActiveStep(status: ApplicationStatus, isGrantee: boolean, hasBatch: boolean, hasOffice: boolean): number {
  if (hasOffice) return 4
  if (hasBatch) return 3
  if (isGrantee) return 2
  if (status !== "pending" && status !== "in_review") return 1
  return 0 // Under Review
}

function getStatusBadge(status: ApplicationStatus, isGrantee: boolean) {
  if (isGrantee) {
    return (
      <Badge
        variant="default"
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Grantee
      </Badge>
    )
  }

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

function getStepIcon(index: number, activeStep: number, status: ApplicationStatus, isGrantee: boolean) {
  const step = TIMELINE_STEPS[index]
  const Icon = step.icon

  if (index === 1 && activeStep >= 1) {
    if (status === "approved") return <CheckCircle2 className="text-green-600" />
    if (status === "needs_revision") return <AlertTriangle className="text-orange-600" />
    if (status === "rejected") return <XCircle className="text-red-600" />
  }

  if (index <= activeStep) {
    return <Icon className={index === activeStep ? "text-primary-foreground" : "text-green-600"} />
  }

  return <Icon className="text-muted-foreground" />
}

export default function DashboardStatusTracker({
  status,
  submittedAt,
  updatedAt,
  latestReviewComments,
  isGrantee = false,
  batchName,
  assignedOffice,
}: StatusTrackerProps) {
  const activeStep = getActiveStep(status, isGrantee, !!batchName, !!assignedOffice)

  return (
    <Card className="h-fit overflow-hidden border-none shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Progress Tracker</CardTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">SPES PROGRAM</p>
          </div>
          {getStatusBadge(status, isGrantee)}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        {/* Timeline */}
        <div className="flex flex-col">
          {TIMELINE_STEPS.map((step, index) => {
            const isActive = index <= activeStep
            const isCurrent = index === activeStep
            const isCompleted = index < activeStep

            return (
              <div key={step.key} className="flex gap-4">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCurrent
                        ? "border-primary bg-primary shadow-sm"
                        : isCompleted
                          ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/30"
                          : "border-muted bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {getStepIcon(index, activeStep, status, isGrantee)}
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-10 w-0.5 transition-colors duration-300",
                        index < activeStep ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <p
                    className={cn(
                      "text-sm font-bold transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {index === 3 && batchName ? (
                      <span className="font-semibold text-primary">{batchName}</span>
                    ) : index === 4 && assignedOffice ? (
                      <span className="font-semibold text-primary">{assignedOffice}</span>
                    ) : (
                      step.description
                    )}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Separator className="opacity-50" />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Submitted</span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="size-3 text-muted-foreground" />
                {new Date(submittedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Update</span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="size-3 text-muted-foreground" />
                {new Date(updatedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Latest review comments */}
          {latestReviewComments && (
            <div className="rounded-lg bg-muted/30 p-3 border border-muted-foreground/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Latest Feedback</p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{latestReviewComments}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-between h-9">
              <Link href="/protected/client/application">
                View Details
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            {status === "needs_revision" && (
              <Button size="sm" asChild className="w-full h-9 bg-orange-600 hover:bg-orange-700">
                <Link href="/protected/client/application?mode=resubmit">
                  <FileText className="size-3.5 mr-2" />
                  Fix Issues
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
