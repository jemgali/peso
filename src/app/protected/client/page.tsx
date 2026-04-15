"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { FileText, LayoutGrid, Activity } from "lucide-react"
import { PageHeader } from "@/components/shared"
import DashboardStatusTracker from "@/components/client/dashboard-status-tracker"
import DashboardNotifications from "@/components/client/dashboard-notifications"
import DashboardCalendar from "@/components/client/dashboard-calendar"
import type { ClientApplicationStatusResponse } from "@/lib/validations/application-review"

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending Review",
    in_review: "Under Review",
    approved: "Approved",
    needs_revision: "Needs Revision",
    rejected: "Rejected",
  }
  return labels[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
  return colors[status] || ""
}

const Page = () => {
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<ClientApplicationStatusResponse["data"] | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/client/application/status")
        const data = await response.json()
        if (data.success) {
          setStatusData(data.data)
        }
      } catch (error) {
        console.error("Error fetching status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your applications and latest updates"
      />

      {/* Main layout: left content + right sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left content */}
        <div className="flex flex-col gap-6">
          {/* Top cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Active Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Applications
                </CardTitle>
                <LayoutGrid className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-3xl font-bold">
                  {statusData?.hasApplication ? 1 : 0}
                </p>
                {statusData?.hasApplication && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">SPES Program</span>
                    </div>
                  </div>
                )}
                {!statusData?.hasApplication && (
                  <p className="text-xs text-muted-foreground">
                    No active applications
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Application Status Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Status
                </CardTitle>
                <Activity className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {statusData?.hasApplication && statusData.submission ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(statusData.submission.status)}
                      >
                        {getStatusLabel(statusData.submission.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SPES</span>
                        <span className="font-medium">
                          {getStatusLabel(statusData.submission.status)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No applications to track
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications Bar — replaces Get Started */}
          <DashboardNotifications />

          {/* Quick Actions (has application, not approved) */}
          {statusData?.hasApplication &&
            statusData.submission?.status !== "approved" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/protected/client/application/status">
                        View Application Status
                      </Link>
                    </Button>
                    {statusData.submission?.status === "needs_revision" && (
                      <Button size="sm" asChild>
                        <Link href="/protected/client/application">
                          <FileText data-icon="inline-start" />
                          Edit & Resubmit
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* No application — show apply button */}
          {!statusData?.hasApplication && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  No active application. Start your SPES application today.
                </p>
                <Button asChild size="sm">
                  <Link href="/protected/client/application">
                    <FileText data-icon="inline-start" />
                    Apply Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Calendar with Announcements — replaces DashboardAnnouncements */}
          <DashboardCalendar />
        </div>

        {/* Right sidebar — Status Tracker */}
        <div className="hidden lg:block">
          {statusData?.hasApplication && statusData.submission ? (
            <div className="sticky top-6">
              <DashboardStatusTracker
                status={statusData.submission.status}
                submissionNumber={statusData.submission.submissionNumber}
                submittedAt={statusData.submission.submittedAt}
                updatedAt={statusData.submission.updatedAt}
                latestReviewComments={
                  statusData.latestReview?.overallComments
                }
              />
            </div>
          ) : (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Submit an application to track your progress here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile status tracker (shown below content on small screens) */}
        <div className="lg:hidden">
          {statusData?.hasApplication && statusData.submission && (
            <DashboardStatusTracker
              status={statusData.submission.status}
              submissionNumber={statusData.submission.submissionNumber}
              submittedAt={statusData.submission.submittedAt}
              updatedAt={statusData.submission.updatedAt}
              latestReviewComments={
                statusData.latestReview?.overallComments
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
