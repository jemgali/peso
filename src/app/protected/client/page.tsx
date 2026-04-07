"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { FileText, CheckCircle2, Clock } from "lucide-react"
import { ApplicationStatusCard } from "@/components/client"
import type { ClientApplicationStatusResponse } from "@/lib/validations/application-review"

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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to PESO System</h1>
        <p className="text-muted-foreground">
          Manage your SPES application and track your progress
        </p>
      </div>

      {statusData?.hasApplication && statusData.submission && (
        <ApplicationStatusCard
          status={statusData.submission.status}
          submissionNumber={statusData.submission.submissionNumber}
          submittedAt={statusData.submission.submittedAt}
          updatedAt={statusData.submission.updatedAt}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <FileText className="size-5 text-primary/40" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statusData?.hasApplication ? 1 : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="size-5 text-primary/40" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold capitalize">
              {statusData?.submission?.status?.replace("_", " ") || "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <CheckCircle2 className="size-5 text-primary/40" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statusData?.submission?.submissionNumber || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {!statusData?.hasApplication && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Start your SPES application process by filling out the application form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/protected/client/application">
                <FileText data-icon="inline-start" />
                Start Application Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {statusData?.hasApplication && statusData.submission?.status !== "approved" && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/protected/client/application/status">
                  View Application Status
                </Link>
              </Button>
              {statusData.submission?.status === "needs_revision" && (
                <Button asChild>
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
    </div>
  )
}

export default Page
