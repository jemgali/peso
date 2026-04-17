"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { ArrowLeft, FileText, History } from "lucide-react";
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
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <ApplicationStatusSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data?.hasApplication) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">No Application Found</h2>
            <p className="text-muted-foreground mt-1">
              You haven&apos;t submitted an application yet.
            </p>
          </div>
          <Link href="/protected/client/application">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Start Application
            </Button>
          </Link>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
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
          submissionNumber={submission.submissionNumber}
          submittedAt={submission.submittedAt}
          updatedAt={submission.updatedAt}
        />
      )}

      {/* Action Button for Revision */}
      {submission?.status === "needs_revision" && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-orange-800 dark:text-orange-300">
                Action Required
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Please review the feedback below and make the necessary changes to your
                application.
              </p>
            </div>
            <Link href="/protected/client/application">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Edit & Resubmit
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {workflow?.isGrantee && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                SPES Grantee Documents
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your printable DOLE SPES forms are now available.
              </p>
            </div>
            <Link href="/protected/client/application/documents">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                View & Print Documents
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {submission?.status === "approved" && !workflow?.isGrantee && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="space-y-1">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">
              Approved Application
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You can track your SPES workflow progress below. Printable forms become available
              only after grantee selection.
            </p>
          </div>
        </Card>
      )}

      {workflow && (
        <Card className="p-6 space-y-4">
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
            <div className="space-y-2">
              <h4 className="font-medium">Upcoming Schedules</h4>
              <div className="space-y-2">
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
        </Card>
      )}

      {/* Latest Review Feedback */}
      {latestReview && (
        <div className="space-y-4">
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
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Review History</h3>
          </div>
          <div className="space-y-4">
            {reviewHistory.map((review: ReviewHistoryItem, index: number) => (
              <div
                key={review.reviewId}
                className={`border-l-2 pl-4 py-2 ${index === 0 ? "border-primary" : "border-muted"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className={
                      review.decision === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : review.decision === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
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
