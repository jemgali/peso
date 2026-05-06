"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";
import { LayoutGrid, Activity, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared";
import DashboardStatusTracker from "@/components/client/dashboard-status-tracker";
import DashboardCalendar from "@/components/client/dashboard-calendar";
import type { ClientApplicationStatusResponse } from "@/lib/validations/application-review";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending Review",
    in_review: "Under Review",
    approved: "Approved",
    needs_revision: "Needs Revision",
    rejected: "Rejected",
  };
  return labels[status] || status;
}

function getDashboardStatusLabel(status: string, isGrantee: boolean) {
  if (isGrantee) return "Grantee"
  return getStatusLabel(status)
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  if (status === "needs_revision") return "secondary";
  return "outline";
}

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<
    ClientApplicationStatusResponse["data"] | null
  >(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/client/application/status");
        const data = await response.json();
        if (data.success) {
          setStatusData(data.data);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="Dashboard"
        description="Overview of your applications and latest updates"
      />

      {/* Main layout: left content + right sidebar */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left content */}
        <div className="flex min-h-0 flex-col gap-4">
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
                      <span className="text-muted-foreground">
                        SPES Program
                      </span>
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
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Activity className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {statusData?.hasApplication && statusData.submission ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant(statusData.submission.status)}
                      >
                        {getDashboardStatusLabel(
                          statusData.submission.status,
                          Boolean(statusData.workflow?.isGrantee),
                        )}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SPES</span>
                        <span className="font-medium">
                          {getDashboardStatusLabel(
                            statusData.submission.status,
                            Boolean(statusData.workflow?.isGrantee),
                          )}
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


          {/* Calendar with Announcements — replaces DashboardAnnouncements */}
          <DashboardCalendar />
        </div>

        {/* Right sidebar — Status Tracker */}
        <div className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-4">
            {statusData?.hasApplication && statusData.submission ? (
              <DashboardStatusTracker
                status={statusData.submission.status}
                submittedAt={statusData.submission.submittedAt}
                updatedAt={statusData.submission.updatedAt}
                latestReviewComments={statusData.latestReview?.overallComments}
                isGrantee={Boolean(statusData.workflow?.isGrantee)}
                batchName={statusData.workflow?.batch?.batchName}
                assignedOffice={statusData.workflow?.assignedOffice}
              />
            ) : (
              <Card className="h-fit overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-base font-bold">SPES Application</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <FileText className="size-6" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold">No Active Application</h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    Start your journey as a SPES grantee today. Submit your application now.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/protected/client/application">
                      Apply Now
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile status tracker */}
        <div className="lg:hidden">
          {statusData?.hasApplication && statusData.submission ? (
            <DashboardStatusTracker
              status={statusData.submission.status}
              submittedAt={statusData.submission.submittedAt}
              updatedAt={statusData.submission.updatedAt}
              latestReviewComments={statusData.latestReview?.overallComments}
              isGrantee={Boolean(statusData.workflow?.isGrantee)}
              batchName={statusData.workflow?.batch?.batchName}
              assignedOffice={statusData.workflow?.assignedOffice}
            />
          ) : (
            <Card className="h-fit overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-base font-bold">SPES Application</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <FileText className="size-6" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold">No Active Application</h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    Start your journey as a SPES grantee today. Submit your application now.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/protected/client/application">
                      Apply Now
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
