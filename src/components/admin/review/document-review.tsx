"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Check, X, AlertCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentFeedback,
  DocumentFeedbackStatus,
} from "@/lib/validations/application-review";

// Document types that can be reviewed
const DOCUMENT_TYPES = [
  {
    id: "psaCertificate",
    name: "PSA Birth Certificate",
    description: "Original or authenticated copy",
    required: true,
  },
  {
    id: "schoolId",
    name: "School ID or Certificate of Enrollment",
    description: "Valid for current school year",
    required: true,
  },
  {
    id: "grades",
    name: "Report Card / Grades",
    description: "Latest available grades",
    required: false,
  },
  {
    id: "barangayCertificate",
    name: "Barangay Certificate of Indigency",
    description: "Proof of residency and indigency status",
    required: false,
  },
  {
    id: "fourPsId",
    name: "4Ps ID",
    description: "For 4Ps program beneficiaries",
    required: false,
  },
  {
    id: "medicalCertificate",
    name: "Medical Certificate",
    description: "Fit to work certification",
    required: false,
  },
];

interface DocumentFeedbackInputProps {
  documentType: string;
  name: string;
  description: string;
  required: boolean;
  feedback: DocumentFeedback | undefined;
  onFeedbackChange: (feedback: DocumentFeedback) => void;
  onFeedbackRemove: () => void;
}

const DocumentFeedbackInput: React.FC<DocumentFeedbackInputProps> = ({
  documentType,
  name,
  description,
  required,
  feedback,
  onFeedbackChange,
  onFeedbackRemove,
}) => {
  const [showComment, setShowComment] = React.useState(!!feedback?.comment);

  const handleStatusChange = (status: DocumentFeedbackStatus) => {
    onFeedbackChange({
      documentType,
      status,
      comment: feedback?.comment,
    });
  };

  const handleCommentChange = (comment: string) => {
    if (feedback) {
      onFeedbackChange({
        ...feedback,
        comment: comment || undefined,
      });
    }
  };

  const getStatusColor = (status: DocumentFeedbackStatus | undefined) => {
    switch (status) {
      case "valid":
        return "border-green-500 bg-green-50 dark:bg-green-950/30";
      case "invalid":
        return "border-red-500 bg-red-50 dark:bg-red-950/30";
      case "missing":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/30";
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        feedback?.status && getStatusColor(feedback.status)
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{name}</h4>
            {required && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={feedback?.status === "valid" ? "default" : "outline"}
            className={cn(
              "h-9",
              feedback?.status === "valid" && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleStatusChange("valid")}
          >
            <Check className="h-4 w-4 mr-1" />
            Valid
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedback?.status === "invalid" ? "default" : "outline"}
            className={cn(
              "h-9",
              feedback?.status === "invalid" && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => handleStatusChange("invalid")}
          >
            <X className="h-4 w-4 mr-1" />
            Invalid
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedback?.status === "missing" ? "default" : "outline"}
            className={cn(
              "h-9",
              feedback?.status === "missing" && "bg-orange-600 hover:bg-orange-700"
            )}
            onClick={() => handleStatusChange("missing")}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Missing
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0"
            onClick={() => setShowComment(!showComment)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showComment && (
        <div className="mt-3">
          <Textarea
            placeholder={`Add a comment about the ${name}...`}
            value={feedback?.comment || ""}
            onChange={(e) => handleCommentChange(e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>
      )}

      {feedback && (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={onFeedbackRemove}
          >
            Clear Status
          </Button>
        </div>
      )}
    </Card>
  );
};

interface DocumentReviewProps {
  documentFeedback: DocumentFeedback[];
  onDocumentFeedbackChange: (feedback: DocumentFeedback[]) => void;
}

const DocumentReview: React.FC<DocumentReviewProps> = ({
  documentFeedback,
  onDocumentFeedbackChange,
}) => {
  const getFeedbackForDocument = (documentType: string) => {
    return documentFeedback.find((f) => f.documentType === documentType);
  };

  const handleFeedbackChange = (feedback: DocumentFeedback) => {
    const existing = documentFeedback.findIndex(
      (f) => f.documentType === feedback.documentType
    );

    if (existing >= 0) {
      const newFeedback = [...documentFeedback];
      newFeedback[existing] = feedback;
      onDocumentFeedbackChange(newFeedback);
    } else {
      onDocumentFeedbackChange([...documentFeedback, feedback]);
    }
  };

  const handleFeedbackRemove = (documentType: string) => {
    onDocumentFeedbackChange(
      documentFeedback.filter((f) => f.documentType !== documentType)
    );
  };

  // Mark all documents as valid
  const markAllValid = () => {
    const newFeedback = DOCUMENT_TYPES.map((doc) => ({
      documentType: doc.id,
      status: "valid" as DocumentFeedbackStatus,
      comment: getFeedbackForDocument(doc.id)?.comment,
    }));
    onDocumentFeedbackChange(newFeedback);
  };

  // Count stats
  const stats = {
    valid: documentFeedback.filter((f) => f.status === "valid").length,
    invalid: documentFeedback.filter((f) => f.status === "invalid").length,
    missing: documentFeedback.filter((f) => f.status === "missing").length,
    total: DOCUMENT_TYPES.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">Document Verification</h3>
          <div className="flex items-center gap-3 text-sm">
            {stats.valid > 0 && (
              <span className="text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                {stats.valid} valid
              </span>
            )}
            {stats.invalid > 0 && (
              <span className="text-red-600 flex items-center gap-1">
                <X className="h-3 w-3" />
                {stats.invalid} invalid
              </span>
            )}
            {stats.missing > 0 && (
              <span className="text-orange-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.missing} missing
              </span>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={markAllValid}>
          <Check className="h-4 w-4 mr-1" />
          Mark All Valid
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Verify each submitted document. Mark as valid, invalid, or missing. Add
        comments if needed.
      </p>

      <div className="space-y-3">
        {DOCUMENT_TYPES.map((doc) => (
          <DocumentFeedbackInput
            key={doc.id}
            documentType={doc.id}
            name={doc.name}
            description={doc.description}
            required={doc.required}
            feedback={getFeedbackForDocument(doc.id)}
            onFeedbackChange={handleFeedbackChange}
            onFeedbackRemove={() => handleFeedbackRemove(doc.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentReview;
