"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import { ArrowLeftIcon, FileTextIcon, HistoryIcon, TriangleAlertIcon, CheckCircleIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusCard, FeedbackDisplay } from "@/components/client";
import { PageHeader } from "@/components/shared";
import { ApplicationStatusSkeleton } from "@/ui/skeletons";
import type {
  ClientApplicationStatusResponse,
  ReviewHistoryItem,
  WorkflowScheduleSummary,
} from "@/lib/validations/application-review";

function toLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatScheduleSummaryDate(schedule: WorkflowScheduleSummary): string {
  const start = new Date(schedule.startDate);
  const end = schedule.endDate ? new Date(schedule.endDate) : null;

  if (schedule.allDay) {
    return end
      ? `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
      : start.toLocaleDateString();
  }

  return end
    ? `${start.toLocaleString()} - ${end.toLocaleString()}`
    : start.toLocaleString();
}

export default function ApplicationStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClientApplicationStatusResponse["data"] | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/client/application/status");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch status");
        }
      } catch {
        setError("An error occurred while fetching your application status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <ApplicationStatusSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.hasApplication) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileTextIcon className="size-12 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">No Application Found</h2>
              <p className="text-muted-foreground mt-1">
                You haven&apos;t submitted an application yet.
              </p>
            </div>
            <Link href="/protected/client/application">
              <Button>
                <FileTextIcon data-icon="inline-start" />
                Start Application
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { submission, latestReview, reviewHistory, workflow } = data;
  const scheduleSummaries: Array<{ label: string; schedule: WorkflowScheduleSummary }> = [];

  if (workflow?.schedules.interview) {
    scheduleSummaries.push({ label: "Interview", schedule: workflow.schedules.interview });
  }
  if (workflow?.schedules.exam) {
    scheduleSummaries.push({ label: "Exam", schedule: workflow.schedules.exam });
  }
  if (workflow?.schedules.orientation) {
    scheduleSummaries.push({ label: "Orientation", schedule: workflow.schedules.orientation });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Dashboard
        </Button>
      </div>
      <PageHeader
        title="Application Status"
        description="Track your SPES application progress and view feedback"
      />

      {/* Status Card */}
      {submission && (
        <ApplicationStatusCard
          status={submission.status}
          submittedAt={submission.submittedAt}
          updatedAt={submission.updatedAt}
        />
      )}

      {/* Action Banner for Revision */}
      {submission?.status === "needs_revision" && (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Please review the feedback below and make the necessary changes to your application.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" asChild>
              <Link href="/protected/client/application">
                <FileTextIcon data-icon="inline-start" />
                Edit &amp; Resubmit
              </Link>
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Grantee Documents Banner */}
      {workflow?.isGrantee && (
        <Alert>
          <CheckCircleIcon />
          <AlertTitle>SPES Grantee Documents Available</AlertTitle>
          <AlertDescription>
            Your printable DOLE SPES forms are now available.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" asChild>
              <Link href="/protected/client/application/documents">
                <FileTextIcon data-icon="inline-start" />
                View &amp; Print
              </Link>
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Approved but not grantee */}
      {submission?.status === "approved" && !workflow?.isGrantee && (
        <Alert>
          <InfoIcon />
          <AlertTitle>Approved Application</AlertTitle>
          <AlertDescription>
            You can track your SPES workflow progress below. Printable forms become available
            only after grantee selection.
          </AlertDescription>
        </Alert>
      )}

      {/* Workflow Progress */}
      {workflow && (
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg">SPES Workflow Progress</h3>
              <p className="text-sm text-muted-foreground">
                Stage: <span className="font-medium text-foreground">{toLabel(workflow.stage)}</span>
              </p>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                Exam Result: <span className="font-medium">{toLabel(workflow.examResult)}</span>
              </p>
              <p>
                Grantee Status:{" "}
                <span className="font-medium">{workflow.isGrantee ? "Selected" : "Not selected"}</span>
              </p>
              {workflow.batch && (
                <p>
                  Batch: <span className="font-medium">{workflow.batch.batchName}</span>
                </p>
              )}
              {(workflow.assignedOffice || workflow.batch?.officeName) && (
                <p>
                  Office:{" "}
                  <span className="font-medium">
                    {workflow.assignedOffice || workflow.batch?.officeName}
                  </span>
                </p>
              )}
            </div>

            {scheduleSummaries.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Upcoming Schedules</h4>
                <div className="flex flex-col gap-2">
                  {scheduleSummaries.map((item) => (
                    <div key={item.schedule.eventId} className="rounded-md border p-3">
                      <p className="text-sm font-medium">
                        {item.label}: {item.schedule.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatScheduleSummaryDate(item.schedule)}
                      </p>
                      {item.schedule.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.schedule.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Latest Review Feedback */}
      {latestReview && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest Review Feedback</h2>
            <span className="text-sm text-muted-foreground">
              Reviewed on {new Date(latestReview.reviewedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Overall Comments */}
          {latestReview.overallComments && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Reviewer Comments</h3>
              <p className="text-sm whitespace-pre-wrap">{latestReview.overallComments}</p>
            </Card>
          )}

          {/* Detailed Feedback */}
          <FeedbackDisplay
            fieldFeedback={latestReview.fieldFeedback}
            documentFeedback={latestReview.documentFeedback}
          />
        </div>
      )}

      {/* Review History */}
      {reviewHistory && reviewHistory.length > 1 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="size-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Review History</h3>
          </div>
          <div className="flex flex-col gap-4">
            {reviewHistory.map((review: ReviewHistoryItem, index: number) => (
              <div
                key={review.reviewId}
                className={`border-l-2 pl-4 py-2 ${index === 0 ? "border-primary" : "border-muted"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      review.decision === "approved"
                        ? "default"
                        : review.decision === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {review.decision === "approved"
                      ? "Approved"
                      : review.decision === "rejected"
                      ? "Rejected"
                      : "Needs Revision"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.reviewedAt).toLocaleString()}
                  </span>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">
                      Latest
                    </Badge>
                  )}
                </div>
                {review.overallComments && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.overallComments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
