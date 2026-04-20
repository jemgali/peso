"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import {
  Check,
  X,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  FileText,
} from "lucide-react";
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

interface ReviewItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded?: DocumentEntry;
  missingRequiredPlaceholder: boolean;
}

const getStatusStyles = (status: DocumentFeedbackStatus | undefined) => {
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
  const uploadedDocs = React.useMemo(
    () =>
      ((data.documents as { documents?: Record<string, DocumentEntry> } | null)
        ?.documents as Record<string, DocumentEntry> | undefined) || {},
    [data.documents],
  );
  const [selectedDocumentId, setSelectedDocumentId] = React.useState("");
  const [openCommentFor, setOpenCommentFor] = React.useState<Record<string, boolean>>(
    {},
  );

  const reviewItems = React.useMemo<ReviewItem[]>(() => {
    return DOCUMENT_TYPES.filter(
      (doc) => doc.required || Boolean(uploadedDocs[doc.id]),
    ).map((doc) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      required: doc.required,
      uploaded: uploadedDocs[doc.id],
      missingRequiredPlaceholder: doc.required && !uploadedDocs[doc.id],
    }));
  }, [uploadedDocs]);

  React.useEffect(() => {
    if (reviewItems.length === 0) {
      setSelectedDocumentId("");
      return;
    }

    if (!selectedDocumentId || !reviewItems.some((item) => item.id === selectedDocumentId)) {
      setSelectedDocumentId(reviewItems[0].id);
    }
  }, [reviewItems, selectedDocumentId]);

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

  const selectedItem = reviewItems.find((item) => item.id === selectedDocumentId);
  const selectedFeedback = selectedItem
    ? getFeedbackForDocument(selectedItem.id)
    : undefined;

  const reviewItemIds = React.useMemo(
    () => new Set(reviewItems.map((item) => item.id)),
    [reviewItems],
  );
  const reviewedFeedback = documentFeedback.filter((feedback) =>
    reviewItemIds.has(feedback.documentType),
  );

  const stats = {
    valid: reviewedFeedback.filter((f) => f.status === "valid").length,
    invalid: reviewedFeedback.filter((f) => f.status === "invalid").length,
    missing: reviewedFeedback.filter((f) => f.status === "missing").length,
    total: reviewItems.length,
  };

  const handleStatusChange = (status: DocumentFeedbackStatus) => {
    if (!selectedItem) return;
    handleFeedbackChange({
      documentType: selectedItem.id,
      status,
      comment: selectedFeedback?.comment,
    });
  };

  const handleCommentChange = (comment: string) => {
    if (!selectedItem) return;
    handleFeedbackChange({
      documentType: selectedItem.id,
      status:
        selectedFeedback?.status ||
        (selectedItem.missingRequiredPlaceholder ? "missing" : "invalid"),
      comment: comment || undefined,
    });
  };

  const markAllValid = () => {
    const newFeedback = reviewItems.map((item) => ({
      documentType: item.id,
      status: item.missingRequiredPlaceholder
        ? ("missing" as DocumentFeedbackStatus)
        : ("valid" as DocumentFeedbackStatus),
      comment: getFeedbackForDocument(item.id)?.comment,
    }));
    onDocumentFeedbackChange(newFeedback);
  };

  const selectedPreviewIsImage = selectedItem?.uploaded?.fileType?.startsWith("image/");
  const selectedPreviewIsPdf = selectedItem?.uploaded?.fileType === "application/pdf";
  const selectedCommentOpen =
    !!selectedItem &&
    (openCommentFor[selectedItem.id] || !!selectedFeedback?.comment);

  const selectedCrossStatus: DocumentFeedbackStatus =
    selectedItem?.missingRequiredPlaceholder ? "missing" : "invalid";

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
            <span className="text-muted-foreground">
              {reviewedFeedback.length}/{stats.total} reviewed
            </span>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={markAllValid}>
          <Check className="h-4 w-4 mr-1" />
          Mark All Ready as Valid
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Review submitted documents and missing required placeholders. Select an
        item on the left, then apply status and comments above the preview.
      </p>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit p-3">
          <h4 className="px-2 pb-2 text-sm font-semibold text-muted-foreground">
            Submitted / Required
          </h4>
          <div className="space-y-2">
            {reviewItems.map((item) => {
              const itemFeedback = getFeedbackForDocument(item.id);
              const isSelected = item.id === selectedDocumentId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDocumentId(item.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    isSelected && "ring-1 ring-primary bg-primary/5",
                    itemFeedback?.status && getStatusStyles(itemFeedback.status),
                    !itemFeedback?.status && item.missingRequiredPlaceholder && "border-orange-200",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "rounded-md p-1.5 shrink-0",
                        item.uploaded
                          ? "bg-green-100 dark:bg-green-900/50"
                          : "bg-orange-100 dark:bg-orange-900/50",
                      )}
                    >
                      {item.uploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
                      ) : (
                        <FileText className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        {item.required && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <p
                        className={cn(
                          "mt-1 truncate text-xs",
                          item.uploaded
                            ? "text-green-700 dark:text-green-400"
                            : "text-orange-700 dark:text-orange-400",
                        )}
                      >
                        {item.uploaded
                          ? `Uploaded: ${item.uploaded.fileName}`
                          : "Missing required document"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card
          className={cn(
            "h-fit p-4",
            selectedFeedback?.status && getStatusStyles(selectedFeedback.status),
          )}
        >
          {selectedItem ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">Document Review</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedItem.name}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedFeedback?.status === "valid" ? "default" : "outline"}
                    className={cn(
                      selectedFeedback?.status === "valid" &&
                        "bg-green-600 hover:bg-green-700",
                    )}
                    disabled={selectedItem.missingRequiredPlaceholder}
                    onClick={() => handleStatusChange("valid")}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Check
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      selectedFeedback?.status === selectedCrossStatus ? "default" : "outline"
                    }
                    className={cn(
                      selectedFeedback?.status === selectedCrossStatus &&
                        (selectedCrossStatus === "missing"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-red-600 hover:bg-red-700"),
                    )}
                    onClick={() => handleStatusChange(selectedCrossStatus)}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cross
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedCommentOpen ? "secondary" : "outline"}
                    onClick={() =>
                      setOpenCommentFor((prev) => ({
                        ...prev,
                        [selectedItem.id]: !selectedCommentOpen,
                      }))
                    }
                  >
                    <MessageSquare className="mr-1.5 h-4 w-4" />
                    Comment
                  </Button>
                  {selectedFeedback && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => handleFeedbackRemove(selectedItem.id)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {selectedCommentOpen && (
                <div className="mb-4">
                  <Textarea
                    placeholder={`Add a comment about ${selectedItem.name}...`}
                    value={selectedFeedback?.comment || ""}
                    onChange={(event) => handleCommentChange(event.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {selectedItem.uploaded ? (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium">{selectedItem.uploaded.fileName}</span>
                      <span className="text-muted-foreground">
                        ({formatFileSize(selectedItem.uploaded.fileSize)})
                      </span>
                      <span className="text-muted-foreground">
                        Uploaded{" "}
                        {new Date(selectedItem.uploaded.uploadedAt).toLocaleString()}
                      </span>
                      <a
                        href={selectedItem.uploaded.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {selectedPreviewIsImage && (
                    <img
                      src={selectedItem.uploaded.url}
                      alt={selectedItem.name}
                      className="max-h-[760px] w-full rounded-md border bg-muted/20 object-contain"
                    />
                  )}

                  {selectedPreviewIsPdf && (
                    <iframe
                      src={selectedItem.uploaded.url}
                      title={selectedItem.name}
                      className="h-[760px] w-full rounded-md border bg-muted/20"
                    />
                  )}

                  {!selectedPreviewIsImage && !selectedPreviewIsPdf && (
                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Preview is unavailable for this file type. Use open to view
                      the document in a new tab.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-10 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-orange-600 dark:text-orange-400" />
                  <p className="font-medium text-orange-700 dark:text-orange-300">
                    Required document not submitted
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use <span className="font-medium">Cross</span> to mark this item
                    as missing and add a comment if needed.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              Select a document from the left to begin review.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DocumentReview;
