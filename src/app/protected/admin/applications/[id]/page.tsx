"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card } from "@/ui/card";
import {
  Loader2,
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import ApplicationViewer from "@/components/admin/review/application-viewer";
import DocumentReview from "@/components/admin/review/document-review";
import ReviewSubmit from "@/components/admin/review/review-submit";
import type {
  ApplicantType,
  ApplicationDetailResponse,
  ApplicationStatus,
  ReviewDecision,
  FieldFeedback,
  DocumentFeedback,
} from "@/lib/validations/application-review";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  needs_revision:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  needs_revision: "Needs Revision",
  rejected: "Rejected",
};

const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  new: "New Applicant",
  spes_baby: "SPES Baby",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationReviewPage({ params }: PageProps) {
  const { id: submissionId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApplicationDetailResponse["data"] | null>(
    null,
  );

  // Review state
  const [fieldFeedback, setFieldFeedback] = useState<FieldFeedback[]>([]);
  const [documentFeedback, setDocumentFeedback] = useState<DocumentFeedback[]>(
    [],
  );
  const [decision, setDecision] = useState<ReviewDecision | "">("");
  const [overallComments, setOverallComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/applications/${submissionId}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
          const latestReview = result.data?.reviews?.[0];
          setDecision(latestReview?.decision || "");
          setOverallComments(latestReview?.overallComments || "");
          setFieldFeedback(latestReview?.fieldFeedback || []);
          setDocumentFeedback(latestReview?.documentFeedback || []);
        } else {
          setError(result.error || "Failed to fetch application");
        }
      } catch {
        setError("An error occurred while fetching the application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [submissionId]);

  const handleSubmitReview = async () => {
    if (!decision) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/applications/${submissionId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            overallComments: overallComments || undefined,
            fieldFeedback: fieldFeedback.length > 0 ? fieldFeedback : undefined,
            documentFeedback:
              documentFeedback.length > 0 ? documentFeedback : undefined,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Review submitted successfully");
        router.push("/protected/admin/applications");
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch {
      toast.error("An error occurred while submitting the review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-500">{error || "Application not found"}</p>
        </Card>
      </div>
    );
  }

  const isReviewable = true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Applications
          </Button>
          <h1 className="text-2xl font-bold">
            {data.profile.profileLastName}, {data.profile.profileFirstName}
            {data.profile.profileMiddleName &&
              ` ${data.profile.profileMiddleName}`}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="secondary"
              className={STATUS_COLORS[data.submission.status]}
            >
              {STATUS_LABELS[data.submission.status]}
            </Badge>
            {data.submission.resubmittedAfterRevision && (
              <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-700 dark:text-emerald-300"
              >
                Resubmitted after revision
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {APPLICANT_TYPE_LABELS[data.submission.applicantType]}
            </span>
            <span className="text-sm text-muted-foreground">
              Submitted{" "}
              {new Date(data.submission.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="application" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="application" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Application Review</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents & Verification</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Review</span>
            <span className="sm:hidden">Submit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="application">
          <ApplicationViewer
            data={data}
            fieldFeedback={fieldFeedback}
            onFieldFeedbackChange={setFieldFeedback}
            isReviewable={isReviewable}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentReview
            data={data}
            documentFeedback={documentFeedback}
            onDocumentFeedbackChange={setDocumentFeedback}
          />
        </TabsContent>

        <TabsContent value="submit">
          <ReviewSubmit
            decision={decision}
            overallComments={overallComments}
            fieldFeedback={fieldFeedback}
            documentFeedback={documentFeedback}
            isSubmitting={isSubmitting}
            onDecisionChange={setDecision}
            onOverallCommentsChange={setOverallComments}
            onSubmit={handleSubmitReview}
          />
        </TabsContent>
      </Tabs>

      {data.reviews.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Review History</h3>
          <div className="space-y-4">
            {data.reviews.map((review) => (
              <div key={review.reviewId} className="border-l-2 py-2 pl-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      review.decision === "approved"
                        ? "bg-green-100 text-green-800"
                        : review.decision === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                    }
                  >
                    {review.decision === "approved"
                      ? "Approved"
                      : review.decision === "rejected"
                        ? "Rejected"
                        : "Needs Revision"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {review.reviewer.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    on {new Date(review.reviewedAt).toLocaleString()}
                  </span>
                </div>
                {review.overallComments && (
                  <p className="mt-2 text-sm">{review.overallComments}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
