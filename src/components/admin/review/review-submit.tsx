"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { Check, X, AlertTriangle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ReviewDecision,
  FieldFeedback,
  DocumentFeedback,
} from "@/lib/validations/application-review";

interface ReviewSubmitProps {
  decision: ReviewDecision | "";
  overallComments: string;
  fieldFeedback: FieldFeedback[];
  documentFeedback: DocumentFeedback[];
  isSubmitting: boolean;
  onDecisionChange: (decision: ReviewDecision) => void;
  onOverallCommentsChange: (comments: string) => void;
  onSubmit: () => void;
}

const DECISION_CONFIG: Record<
  ReviewDecision,
  { label: string; description: string; icon: React.ReactNode; color: string }
> = {
  approved: {
    label: "Approve Application",
    description: "The application meets all requirements and is approved.",
    icon: <Check className="h-5 w-5" />,
    color: "text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30",
  },
  needs_revision: {
    label: "Request Revision",
    description: "The applicant needs to make changes and resubmit.",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30",
  },
  rejected: {
    label: "Reject Application",
    description: "The application does not meet requirements.",
    icon: <X className="h-5 w-5" />,
    color: "text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
  },
};

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  decision,
  overallComments,
  fieldFeedback,
  documentFeedback,
  isSubmitting,
  onDecisionChange,
  onOverallCommentsChange,
  onSubmit,
}) => {
  // Validation checks
  const invalidFields = fieldFeedback.filter((f) => f.status === "invalid");
  const invalidDocs = documentFeedback.filter(
    (f) => f.status === "invalid" || f.status === "missing"
  );
  const hasIssues = invalidFields.length > 0 || invalidDocs.length > 0;

  // Warning if approving with issues
  const showApprovalWarning = decision === "approved" && hasIssues;

  // Require comments for rejection
  const requiresComments = decision === "rejected" && !overallComments.trim();

  const canSubmit = decision && !requiresComments && !isSubmitting;

  const getConfirmationMessage = () => {
    switch (decision) {
      case "approved":
        return "This will approve the application. The applicant will be notified via email and in-app notification.";
      case "needs_revision":
        return "This will request the applicant to revise their application. They will see the feedback you provided and can make changes.";
      case "rejected":
        return "This will reject the application. This action cannot be undone. The applicant will be notified.";
      default:
        return "";
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Submit Review</h3>
        <p className="text-sm text-muted-foreground">
          Review your feedback and make a final decision on this application.
        </p>
      </div>

      {/* Review Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Field Feedback</p>
          <p className="text-lg font-semibold">{fieldFeedback.length} fields</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Invalid Fields</p>
          <p className={cn("text-lg font-semibold", invalidFields.length > 0 && "text-red-600")}>
            {invalidFields.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Documents Reviewed</p>
          <p className="text-lg font-semibold">{documentFeedback.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Document Issues</p>
          <p className={cn("text-lg font-semibold", invalidDocs.length > 0 && "text-orange-600")}>
            {invalidDocs.length}
          </p>
        </div>
      </div>

      {/* Decision Selection */}
      <div className="space-y-3">
        <Label>Decision</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.entries(DECISION_CONFIG) as [ReviewDecision, typeof DECISION_CONFIG["approved"]][]).map(
            ([value, config]) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "p-4 border-2 rounded-lg text-left transition-colors",
                  decision === value
                    ? cn("bg-muted", config.color)
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => onDecisionChange(value)}
              >
                <div className={cn("flex items-center gap-2", decision === value && config.color)}>
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Warnings */}
      {showApprovalWarning && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">
                Approval with Issues
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                You have marked {invalidFields.length} field(s) and {invalidDocs.length}{" "}
                document(s) as invalid/missing but are approving the application. Are you sure?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Comments */}
      <div className="space-y-2">
        <Label htmlFor="overallComments">
          Overall Comments
          {decision === "rejected" && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id="overallComments"
          placeholder="Add any overall comments about this application..."
          value={overallComments}
          onChange={(e) => onOverallCommentsChange(e.target.value)}
          rows={4}
        />
        {requiresComments && (
          <p className="text-sm text-red-500">
            Please provide a reason for rejection.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" disabled={!canSubmit}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Review
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Review Submission</AlertDialogTitle>
              <AlertDialogDescription>{getConfirmationMessage()}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

export default ReviewSubmit;
