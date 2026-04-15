"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Check, X, AlertCircle, MessageSquare, ExternalLink, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentFeedback,
  DocumentFeedbackStatus,
  ApplicationDetailResponse,
} from "@/lib/validations/application-review";

interface DocumentEntry {
  key: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Document types that can be reviewed
const DOCUMENT_TYPES = [
  {
    id: "psaCertificate",
    name: "Original PSA Certificate",
    description: "Original or authenticated PSA birth certificate",
    required: true,
  },
  {
    id: "grades",
    name: "Grades",
    description: "Latest available report card or transcript of records",
    required: true,
  },
  {
    id: "affidavitLowIncome",
    name: "Affidavit of Low Income (PAO)",
    description: "Affidavit of low income from the Public Attorney's Office",
    required: true,
  },
  {
    id: "barangayCertLowIncome",
    name: "Barangay Certificate of Low Income (Parents)",
    description: "Certificate of low income issued by the barangay for parents",
    required: true,
  },
  {
    id: "barangayCertResidency",
    name: "Barangay Certificate of Residency (Applicant)",
    description: "Certificate of residency issued by the barangay for the applicant",
    required: true,
  },
  {
    id: "incomeTaxReturn",
    name: "Income Tax Return",
    description: "Latest Income Tax Return (ITR) of parent/guardian",
    required: true,
  },
  {
    id: "affidavitSoloParent",
    name: "Affidavit of Solo Parent",
    description: "If applicable — submit affidavit of solo parent status",
    required: false,
  },
  {
    id: "affidavitDiscrepancy",
    name: "Affidavit of Discrepancy",
    description: "If applicable — submit affidavit of discrepancy in documents",
    required: false,
  },
  {
    id: "deathCertificate",
    name: "Death Certificate",
    description: "If parent/s is/are deceased — submit death certificate",
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
  data: NonNullable<ApplicationDetailResponse["data"]>;
  documentFeedback: DocumentFeedback[];
  onDocumentFeedbackChange: (feedback: DocumentFeedback[]) => void;
}

const DocumentReview: React.FC<DocumentReviewProps> = ({
  data,
  documentFeedback,
  onDocumentFeedbackChange,
}) => {
  // Extract uploaded documents from application data
  const uploadedDocs = (data.documents as Record<string, unknown> | null)?.documents as Record<string, DocumentEntry> | undefined;

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
        {DOCUMENT_TYPES.map((doc) => {
          const uploaded = uploadedDocs?.[doc.id];
          return (
            <div key={doc.id}>
              {/* Upload status */}
              {uploaded && (
                <div className="flex items-center gap-2 mb-1 px-4 pt-2 text-xs text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="truncate">{uploaded.fileName}</span>
                  <span className="text-muted-foreground">({formatFileSize(uploaded.fileSize)})</span>
                  <a
                    href={uploaded.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 ml-auto hover:underline text-blue-600 dark:text-blue-400"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {!uploaded && (
                <div className="flex items-center gap-2 mb-1 px-4 pt-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{doc.required ? "Not uploaded" : "Not submitted"}</span>
                </div>
              )}
              <DocumentFeedbackInput
                documentType={doc.id}
                name={doc.name}
                description={doc.description}
                required={doc.required}
                feedback={getFeedbackForDocument(doc.id)}
                onFeedbackChange={handleFeedbackChange}
                onFeedbackRemove={() => handleFeedbackRemove(doc.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentReview;
