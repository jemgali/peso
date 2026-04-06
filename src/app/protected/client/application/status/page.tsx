"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { ArrowLeft, FileText, History } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusCard, FeedbackDisplay } from "@/components/client";
import { ApplicationStatusSkeleton } from "@/ui/skeletons";
import type {
  ClientApplicationStatusResponse,
  ReviewHistoryItem,
} from "@/lib/validations/application-review";

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

  const { submission, latestReview, reviewHistory } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Application Status</h1>
        <p className="text-muted-foreground">
          Track your SPES application progress and view feedback
        </p>
      </div>

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
