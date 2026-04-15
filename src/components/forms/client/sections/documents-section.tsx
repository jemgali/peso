"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/ui/card";
import { FieldGroup } from "@/ui/field";
import { Button } from "@/ui/button";
import { FileText, Upload, X, Loader2, CheckCircle2, ExternalLink, Image as ImageIcon, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
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

const REQUIRED_DOCUMENTS = [
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

// Sample document descriptions for the "View Sample" dialog
const DOCUMENT_SAMPLES: Record<string, { title: string; tips: string[] }> = {
  psaCertificate: {
    title: "PSA Birth Certificate",
    tips: [
      "Must be an original or authenticated copy from the Philippine Statistics Authority (PSA)",
      "The document should be clear and readable with no blurred sections",
      "All pages must be included if multi-page",
      "Scan or photo must show the full document including the security paper",
    ],
  },
  grades: {
    title: "Report Card / Grades",
    tips: [
      "Latest available report card or transcript of records",
      "Should show your full name and school name",
      "Include all pages with grades visible",
      "An official copy with school seal or stamp is preferred",
    ],
  },
  affidavitLowIncome: {
    title: "Affidavit of Low Income (PAO)",
    tips: [
      "Obtained from the Public Attorney's Office (PAO)",
      "Must state your family's income status",
      "Document must be notarized",
      "Should be recent (within the current year)",
    ],
  },
  barangayCertLowIncome: {
    title: "Barangay Certificate of Low Income",
    tips: [
      "Issued by the barangay where your parents reside",
      "Must state your parent's/guardian's income status",
      "Should include the barangay official's signature and seal",
      "Must be current and not expired",
    ],
  },
  barangayCertResidency: {
    title: "Barangay Certificate of Residency",
    tips: [
      "Issued by the barangay where you currently reside",
      "Must state your name and address clearly",
      "Should include the barangay official's signature and seal",
      "Must be current and not expired",
    ],
  },
  incomeTaxReturn: {
    title: "Income Tax Return (ITR)",
    tips: [
      "Latest Income Tax Return of parent or guardian",
      "BIR Form 2316 or any applicable ITR form",
      "If parent is not employed, a Certificate of No Filing from BIR may be submitted",
      "All pages of the document must be included",
    ],
  },
  affidavitSoloParent: {
    title: "Affidavit of Solo Parent",
    tips: [
      "Only required if you have a solo parent",
      "Document must be notarized",
      "Should state the circumstances of solo parenthood",
    ],
  },
  affidavitDiscrepancy: {
    title: "Affidavit of Discrepancy",
    tips: [
      "Only required if there are discrepancies in your documents (e.g., name spelling differences)",
      "Document must be notarized",
      "Should clearly state and explain the discrepancy",
    ],
  },
  deathCertificate: {
    title: "Death Certificate",
    tips: [
      "Only required if parent/s is/are deceased",
      "Must be from PSA or local civil registry",
      "Document should be clear and legible",
    ],
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentsSection: React.FC<FormSectionProps> = ({
  isPending,
  setValue,
  formValues,
}) => {
  const formDocs = formValues?.documents as DocumentsMap | undefined;
  const [uploadedDocs, setUploadedDocs] = useState<DocumentsMap>(formDocs || {});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleFileSelect = async (documentId: string, file: File) => {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

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
          setTimeout(() => setValue("documents", newDocs, { shouldValidate: true, shouldTouch: true }), 0);
        }
        return newDocs;
      });

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

  // Separate required and optional documents for display
  const requiredDocs = REQUIRED_DOCUMENTS.filter((d) => d.required);
  const optionalDocs = REQUIRED_DOCUMENTS.filter((d) => !d.required);

  const renderDocumentCard = (doc: (typeof REQUIRED_DOCUMENTS)[number]) => {
    const uploaded = uploadedDocs[doc.id];
    const isUploading = uploading[doc.id];
    const isDeleting = deleting[doc.id];
    const isImage = uploaded?.fileType?.startsWith("image/");

    return (
      <Card
        key={doc.id}
        className={cn(
          "p-4 transition-colors",
          isPending && "opacity-50",
          uploaded && "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            uploaded ? "bg-green-100 dark:bg-green-900/50" : "bg-muted"
          )}>
            {uploaded ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : isImage ? (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <FileText className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{doc.name}</h4>
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
            <p className="text-xs text-muted-foreground mt-0.5">
              {doc.description}
            </p>
            {/* View Sample button */}
            {DOCUMENT_SAMPLES[doc.id] && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs text-blue-600 dark:text-blue-400 mt-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Requirements
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{DOCUMENT_SAMPLES[doc.id].title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Make sure your document meets these requirements:</p>
                    <ul className="space-y-2">
                      {DOCUMENT_SAMPLES[doc.id].tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: JPEG, PNG, GIF, WebP, PDF (max 10MB)
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {uploaded && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                <span className="truncate max-w-[200px]">{uploaded.fileName}</span>
                <span className="text-muted-foreground">({formatFileSize(uploaded.fileSize)})</span>
                <a
                  href={uploaded.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {uploaded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDeleting || isPending}
                onClick={() => handleDelete(doc.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
            <input
              type="file"
              ref={(el) => { fileInputRefs.current[doc.id] = el; }}
              onChange={(e) => handleInputChange(doc.id, e)}
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
            />
            <Button
              type="button"
              variant={uploaded ? "outline" : "default"}
              size="sm"
              disabled={isUploading || isPending}
              onClick={() => fileInputRefs.current[doc.id]?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : uploaded ? (
                <>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Replace
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div id="documents" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Required Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the following documents. Accepted formats: JPEG, PNG, GIF, WebP, PDF (max 10MB each).
        </p>
      </div>

      <FieldGroup>
        <div className="space-y-3">
          {requiredDocs.map(renderDocumentCard)}
        </div>

        {optionalDocs.length > 0 && (
          <>
            <div className="mt-6 mb-3">
              <h3 className="text-base font-medium text-muted-foreground">
                Additional Documents (If Applicable)
              </h3>
            </div>
            <div className="space-y-3">
              {optionalDocs.map(renderDocumentCard)}
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
                For best results, ensure documents are clear and readable. You can upload images (JPEG, PNG) or PDF files up to 10MB each.
              </p>
            </div>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
};

export default DocumentsSection;
