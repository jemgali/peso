"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card } from "@/ui/card";
import { FieldGroup } from "@/ui/field";
import { Button } from "@/ui/button";
import {
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FormSectionProps } from "./types";

interface UploadedDocument {
  key: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface DocumentsMap {
  [key: string]: UploadedDocument;
}

interface SampleImage {
  src: string;
  label: string;
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  sampleImages?: SampleImage[];
}

interface LocalPreview {
  url: string;
  fileType: string;
  fileName: string;
}

type PreviewMode = "auto" | "sample" | "uploaded";

const SAMPLE_BASE = "/assets/sample_forms/spes_req";

const REQUIRED_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "psaCertificate",
    name: "Original PSA Certificate",
    description: "Original or authenticated PSA birth certificate",
    required: true,
    sampleImages: [
      { src: `${SAMPLE_BASE}/psa-birth-cert.jpg`, label: "psa-birth-cert.jpg" },
    ],
  },
  {
    id: "grades",
    name: "Grades",
    description: "Latest available report card or transcript of records",
    required: true,
    sampleImages: [
      {
        src: `${SAMPLE_BASE}/report-card-front.jpg`,
        label: "report-card-front.jpg",
      },
      {
        src: `${SAMPLE_BASE}/report-card-back.jpg`,
        label: "report-card-back.jpg",
      },
    ],
  },
  {
    id: "affidavitLowIncome",
    name: "Affidavit of Low Income (PAO)",
    description: "Affidavit of low income from the Public Attorney's Office",
    required: true,
    sampleImages: [{ src: `${SAMPLE_BASE}/low-income.jpg`, label: "low-income.jpg" }],
  },
  {
    id: "barangayCertLowIncome",
    name: "Barangay Certificate of Low Income (Parents)",
    description: "Certificate of low income issued by the barangay for parents",
    required: true,
    sampleImages: [
      {
        src: `${SAMPLE_BASE}/inc-tax-return-2.jpg`,
        label: "inc-tax-return-2.jpg",
      },
    ],
  },
  {
    id: "barangayCertResidency",
    name: "Barangay Certificate of Residency (Applicant)",
    description: "Certificate of residency issued by the barangay for the applicant",
    required: true,
    sampleImages: [
      {
        src: `${SAMPLE_BASE}/proof-of-residency.jpg`,
        label: "proof-of-residency.jpg",
      },
    ],
  },
  {
    id: "incomeTaxReturn",
    name: "Income Tax Return",
    description: "Latest Income Tax Return (ITR) of parent/guardian",
    required: true,
    sampleImages: [
      {
        src: `${SAMPLE_BASE}/inc-tax-return-1.jpg`,
        label: "inc-tax-return-1.jpg",
      },
    ],
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf"];

const DocumentsSection: React.FC<FormSectionProps> = ({
  isPending,
  setValue,
  formValues,
}) => {
  const formDocs = formValues?.documents as DocumentsMap | undefined;
  const [uploadedDocs, setUploadedDocs] = useState<DocumentsMap>(formDocs || {});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [localPreviews, setLocalPreviews] = useState<Record<string, LocalPreview>>(
    {},
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(
    REQUIRED_DOCUMENTS[0]?.id || "",
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>("auto");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const localPreviewUrlsRef = useRef<Record<string, string>>({});

  // Fetch existing documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      // If we already have docs in form state, no need to overwrite
      if (formDocs && Object.keys(formDocs).length > 0) return;
      try {
        const response = await fetch("/api/client/application/status");
        if (response.ok) {
          const data = await response.json();
          if (data.data?.documents?.documents) {
            setUploadedDocs(data.data.documents.documents as DocumentsMap);
            if (setValue) {
              setValue("documents", data.data.documents.documents, { shouldValidate: true, shouldTouch: true });
            }
          }
        }
      } catch {
        // Silently fail - user may not have documents yet
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(localPreviewUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const requiredDocs = useMemo(
    () => REQUIRED_DOCUMENTS.filter((d) => d.required),
    [],
  );
  const optionalDocs = useMemo(
    () => REQUIRED_DOCUMENTS.filter((d) => !d.required),
    [],
  );

  useEffect(() => {
    if (!selectedDocumentId && requiredDocs.length > 0) {
      setSelectedDocumentId(requiredDocs[0].id);
    }
  }, [requiredDocs, selectedDocumentId]);

  const selectedRequirement = useMemo(
    () =>
      REQUIRED_DOCUMENTS.find((doc) => doc.id === selectedDocumentId) ||
      requiredDocs[0],
    [requiredDocs, selectedDocumentId],
  );

  useEffect(() => {
    setPreviewMode("auto");
  }, [selectedDocumentId]);

  const clearLocalPreview = (documentId: string) => {
    const existingUrl = localPreviewUrlsRef.current[documentId];
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      delete localPreviewUrlsRef.current[documentId];
    }

    setLocalPreviews((prev) => {
      if (!prev[documentId]) return prev;
      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  };

  const setLocalPreview = (documentId: string, file: File) => {
    clearLocalPreview(documentId);
    const url = URL.createObjectURL(file);
    localPreviewUrlsRef.current[documentId] = url;
    setLocalPreviews((prev) => ({
      ...prev,
      [documentId]: {
        url,
        fileType: file.type,
        fileName: file.name,
      },
    }));
  };

  const handleFileSelect = async (documentId: string, file: File) => {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF document only.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setSelectedDocumentId(documentId);
    setLocalPreview(documentId, file);
    setUploading((prev) => ({ ...prev, [documentId]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update local state
      setUploadedDocs((prev) => {
        const newDocs = {
          ...prev,
          [documentId]: {
            key: result.data.key,
            url: result.data.url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          },
        };
        if (setValue) {
          setTimeout(
            () =>
              setValue("documents", newDocs, {
                shouldValidate: true,
                shouldTouch: true,
              }),
            0,
          );
        }
        return newDocs;
      });

      clearLocalPreview(documentId);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setUploading((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const handleDelete = async (documentId: string) => {
    const doc = uploadedDocs[documentId];
    if (!doc) return;

    setDeleting((prev) => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch(`/api/upload/${encodeURIComponent(doc.key)}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Delete failed");
      }

      // Remove from local state
      setUploadedDocs((prev) => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        if (setValue) {
          setTimeout(() => setValue("documents", newDocs, { shouldValidate: true, shouldTouch: true }), 0);
        }
        return newDocs;
      });

      clearLocalPreview(documentId);
      toast.success("Document removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete document");
    } finally {
      setDeleting((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const handleInputChange = (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(documentId, file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const renderDocumentListItem = (doc: DocumentRequirement) => {
    const uploaded = uploadedDocs[doc.id];
    const isSelected = selectedRequirement?.id === doc.id;

    return (
      <button
        type="button"
        key={doc.id}
        onClick={() => setSelectedDocumentId(doc.id)}
        className={cn(
          "w-full rounded-lg border p-3 text-left transition-colors",
          isPending && "opacity-50",
          uploaded && "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
          isSelected && "ring-1 ring-primary bg-primary/5"
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className={cn(
            "p-1.5 rounded-md shrink-0",
            uploaded ? "bg-green-100 dark:bg-green-900/50" : "bg-muted"
          )}>
            {uploaded ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium leading-tight">{doc.name}</h4>
              {doc.required ? (
                <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                  Required
                </span>
              ) : (
                <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                  If Applicable
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {doc.description}
            </p>
            {uploaded && (
              <div className="mt-1 text-xs text-green-700 dark:text-green-400 truncate">
                Uploaded: {uploaded.fileName}
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          ref={(el) => { fileInputRefs.current[doc.id] = el; }}
          onChange={(e) => handleInputChange(doc.id, e)}
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
        />
      </button>
    );
  };

  const previewDocumentId = selectedRequirement?.id || "";
  const selectedUploadedDoc = previewDocumentId
    ? uploadedDocs[previewDocumentId]
    : undefined;
  const selectedLocalPreview = previewDocumentId
    ? localPreviews[previewDocumentId]
    : undefined;
  const hasSelectedUpload = !!selectedUploadedDoc || !!selectedLocalPreview;
  const shouldShowUploadedPreview =
    previewMode === "uploaded"
      ? hasSelectedUpload
      : previewMode === "sample"
        ? false
        : hasSelectedUpload;
  const showingUploadedPreview = shouldShowUploadedPreview && !!selectedUploadedDoc;
  const showingLocalPreview = shouldShowUploadedPreview && !!selectedLocalPreview && !selectedUploadedDoc;
  const uploadedFileType =
    selectedUploadedDoc?.fileType || selectedLocalPreview?.fileType || "";
  const isUploadedImage = uploadedFileType.startsWith("image/");
  const isUploadedPdf = uploadedFileType === "application/pdf";
  const selectedIsUploading = previewDocumentId ? !!uploading[previewDocumentId] : false;
  const selectedIsDeleting = previewDocumentId ? !!deleting[previewDocumentId] : false;
  const canShowSample = (selectedRequirement?.sampleImages?.length || 0) > 0;

  return (
    <div id="documents" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Required Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the following documents as PDF files only (max 10MB each).
        </p>
      </div>

      <FieldGroup>
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Documents to be submitted
            </h3>
            <div className="space-y-2">
              {requiredDocs.map(renderDocumentListItem)}
            </div>

            {optionalDocs.length > 0 && (
              <>
                <div className="mt-6 mb-3">
                  <h3 className="text-base font-medium text-muted-foreground">
                    Additional Documents (If Applicable)
                  </h3>
                </div>
                <div className="space-y-2">
                  {optionalDocs.map(renderDocumentListItem)}
                </div>
              </>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Upload Tips
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    For best results, ensure documents are clear and readable.
                    Only PDF files are accepted, up to 10MB each.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="h-fit p-4 xl:sticky xl:top-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Document Preview</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedRequirement
                  ? selectedRequirement.name
                  : "Select a requirement to preview"}
              </p>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canShowSample}
                onClick={() => setPreviewMode("sample")}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View Requirement Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasSelectedUpload}
                onClick={() => setPreviewMode("uploaded")}
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Select Uploaded Preview
              </Button>
              <Button
                type="button"
                size="sm"
                variant={hasSelectedUpload ? "outline" : "default"}
                disabled={isPending || selectedIsUploading || !previewDocumentId}
                onClick={() => fileInputRefs.current[previewDocumentId]?.click()}
              >
                {selectedIsUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : hasSelectedUpload ? (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Replace Upload
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload
                  </>
                )}
              </Button>
              {selectedUploadedDoc && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isPending || selectedIsDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                  onClick={() => handleDelete(previewDocumentId)}
                >
                  {selectedIsDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Remove Upload
                    </>
                  )}
                </Button>
              )}
            </div>

            {showingUploadedPreview && (
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
                Showing uploaded file
              </p>
            )}
            {showingLocalPreview && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
                Showing selected file preview (uploading)
              </p>
            )}

            {shouldShowUploadedPreview && isUploadedImage && (
              <div className="space-y-2">
                <img
                  src={(selectedUploadedDoc?.url || selectedLocalPreview?.url) ?? ""}
                  alt={selectedRequirement?.name || "Uploaded preview"}
                  className="w-full rounded-md border object-contain bg-muted/20 max-h-[720px]"
                />
                <p className="text-xs text-muted-foreground truncate">
                  {(selectedUploadedDoc?.fileName || selectedLocalPreview?.fileName) ??
                    ""}
                </p>
              </div>
            )}

            {shouldShowUploadedPreview && isUploadedPdf && (
              <div className="space-y-2">
                <iframe
                  src={(selectedUploadedDoc?.url || selectedLocalPreview?.url) ?? ""}
                  title={selectedRequirement?.name || "Uploaded PDF preview"}
                  className="h-[720px] w-full rounded-md border bg-muted/20"
                />
                <a
                  href={(selectedUploadedDoc?.url || selectedLocalPreview?.url) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Open PDF in new tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {!shouldShowUploadedPreview &&
              (selectedRequirement?.sampleImages?.length || 0) > 0 && (
                <div className="space-y-3">
                  {selectedRequirement?.sampleImages?.map((sample) => (
                    <div key={sample.src} className="space-y-1">
                      <img
                        src={sample.src}
                        alt={`${selectedRequirement.name} sample`}
                        className="w-full rounded-md border object-contain bg-muted/20 max-h-[720px]"
                      />
                      <p className="text-xs text-muted-foreground">{sample.label}</p>
                    </div>
                  ))}
                </div>
              )}

            {!shouldShowUploadedPreview &&
              !selectedRequirement?.sampleImages?.length && (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No sample preview available for this document.
                </div>
              )}

            {!selectedRequirement && (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Select a requirement from the left to view preview.
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground">
              Click document name from left list to switch requirement preview.
            </div>
          </Card>
        </div>
      </FieldGroup>
    </div>
  );
};

export default DocumentsSection;
