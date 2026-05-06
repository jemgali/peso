/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Spinner } from "@/ui/spinner";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import type { ReviewSectionProps } from "./types";

interface UploadedDocument {
  key?: string;
  url?: string;
  fileName?: string;
  fileType?: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  psaCertificate: "Original PSA Certificate",
  proofOfEnrollment: "Proof of Enrollment",
  grades: "Grades",
  affidavitLowIncome: "Affidavit of Low Income (PAO)",
  barangayCertLowIncome: "Barangay Certificate of Low Income (Parents)",
  barangayCertResidency: "Barangay Certificate of Residency (Applicant)",
  outOfSchoolYouthCertificate: "Out Of School Youth Certificate",
  certificateOfGuardianship: "Certificate of Guardianship",
  incomeTaxReturn: "Income Tax Return",
  certificateOfMarriage: "Certificate of Marriage",
  affidavitSoloParent: "Affidavit of Solo Parent",
  affidavitDiscrepancy: "Affidavit of Discrepancy",
  deathCertificate: "Death Certificate",
};

const REQUIRED_DOCUMENT_IDS = [
  "psaCertificate",
  "proofOfEnrollment",
  "grades",
  "affidavitLowIncome",
  "barangayCertLowIncome",
  "barangayCertResidency",
];

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formValues,
  isPending,
  isValid,
  onSubmitRequest,
  errors,
  incompleteSections,
  triggerValidation,
  visibleSectionIds,
  revisionTargets,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");

  const handleSubmitClick = () => {
    if (isValid) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    onSubmitRequest();
  };

  // Helper to format name
  const formatName = () => {
    return [
      formValues.profileFirstName,
      formValues.profileMiddleName,
      formValues.profileLastName,
      formValues.profileSuffix,
    ]
      .filter(Boolean)
      .join(" ") || "Not provided";
  };

  // Helper to format address
  const formatAddress = () => {
    const parts = [
      formValues.profileHouseStreet,
      formValues.profileBarangay,
      formValues.profileMunicipality,
      formValues.profileProvince,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  // Helper to format languages
  const formatLanguages = () => {
    if (!formValues.profileLanguageDialect || formValues.profileLanguageDialect.length === 0) {
      return "Not provided";
    }
    return formValues.profileLanguageDialect
      .map((item) => item.value)
      .filter(Boolean)
      .join(", ") || "Not provided";
  };

  // Helper to format skills
  const formatSkills = () => {
    if (!formValues.skills || formValues.skills.length === 0) {
      return "Not provided";
    }
    return formValues.skills
      .map((item) => item.value)
      .filter(Boolean)
      .join(", ") || "Not provided";
  };

  const uploadedDocuments = (formValues.documents || {}) as Record<
    string,
    UploadedDocument
  >;
  const visibleSectionSet = useMemo(
    () =>
      new Set(
        (visibleSectionIds || [])
          .filter((sectionId) => sectionId !== "review")
          .map((sectionId) => String(sectionId)),
      ),
    [visibleSectionIds],
  );
  const isRevisionScoped = visibleSectionSet.size > 0;
  const showSection = (sectionId: string) =>
    !isRevisionScoped || visibleSectionSet.has(sectionId);
  const scopedDocumentIdSet = useMemo(
    () =>
      new Set(
        (revisionTargets?.documents || []).map((feedback) => feedback.documentType),
      ),
    [revisionTargets],
  );
  const shouldScopeDocuments = scopedDocumentIdSet.size > 0;
  const uploadedDocumentEntries = useMemo(
    () => {
      const allEntries = Object.entries(uploadedDocuments);
      if (!shouldScopeDocuments) return allEntries;
      return allEntries.filter(([documentId]) => scopedDocumentIdSet.has(documentId));
    },
    [uploadedDocuments, scopedDocumentIdSet, shouldScopeDocuments],
  );
  const requiredUploadedDocuments = useMemo(
    () =>
      uploadedDocumentEntries.filter(([documentId]) =>
        REQUIRED_DOCUMENT_IDS.includes(documentId),
      ),
    [uploadedDocumentEntries],
  );
  const optionalUploadedDocuments = useMemo(
    () =>
      uploadedDocumentEntries.filter(
        ([documentId]) => !REQUIRED_DOCUMENT_IDS.includes(documentId),
      ),
    [uploadedDocumentEntries],
  );

  const activeSelectedDocumentId =
    selectedDocumentId && uploadedDocuments[selectedDocumentId]
      ? selectedDocumentId
      : requiredUploadedDocuments[0]?.[0] || optionalUploadedDocuments[0]?.[0] || "";

  const selectedDocument = activeSelectedDocumentId
    ? uploadedDocuments[activeSelectedDocumentId]
    : undefined;

  return (
    <div id="review" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Review Application</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-4">
        {showSection("basic-info") && (
          <>
            {/* Basic Information */}
            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Legal Name</p>
                  <p className="font-medium uppercase">{formatName()}</p>
                </div>
              </div>
            </Card>

            {/* Personal Details */}
            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Birthdate</p>
                  <p className="font-medium uppercase">
                    {formValues.profileBirthdate || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium uppercase">
                    {formValues.profileAge !== undefined && formValues.profileAge !== null ? formValues.profileAge : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sex</p>
                  <p className="font-medium uppercase">
                    {formValues.profileSex || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Civil Status</p>
                  <p className="font-medium uppercase">
                    {formValues.profileCivilStatus || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Religion</p>
                  <p className="font-medium uppercase">
                    {formValues.profileReligion || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Languages</p>
                  <p className="font-medium uppercase">{formatLanguages()}</p>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact Number</p>
                  <p className="font-medium">
                    {formValues.profileContact || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {formValues.profileEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Facebook</p>
                  <p className="font-medium truncate">
                    {formValues.profileFacebook || "Not provided"}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Address */}
        {showSection("address") && (
          <Card className="p-4 bg-muted/30">
            <h3 className="text-sm font-semibold mb-3">Address</h3>
            <p className="text-sm font-medium uppercase">{formatAddress()}</p>
          </Card>
        )}

        {/* Education */}
        {showSection("education") && (
          <Card className="p-4 bg-muted/30">
            <h3 className="text-sm font-semibold mb-3">Education</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Grade/Year Level</p>
                <p className="font-medium uppercase">
                  {formValues.gradeYear || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">School Name</p>
                <p className="font-medium uppercase">
                  {formValues.schoolName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Track/Course</p>
                <p className="font-medium uppercase">
                  {formValues.trackCourse || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">School Year</p>
                <p className="font-medium uppercase">
                  {formValues.schoolYear || "Not provided"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Family Information */}
        {showSection("family") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Family Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Father</p>
              <p className="font-medium uppercase">
                {formValues.fatherName || "Not provided"}
              </p>
              {formValues.fatherOccupation && (
                <p className="text-xs text-muted-foreground uppercase">
                  {formValues.fatherOccupation}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Mother</p>
              <p className="font-medium uppercase">
                {formValues.motherMaidenName || "Not provided"}
              </p>
              {formValues.motherOccupation && (
                <p className="text-xs text-muted-foreground uppercase">
                  {formValues.motherOccupation}
                </p>
              )}
            </div>
          </div>
          {formValues.siblings && formValues.siblings.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-muted-foreground text-sm mb-2">
                Siblings ({formValues.numberOfSiblings})
              </p>
              <div className="space-y-1">
                {formValues.siblings.map((sibling, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium uppercase">{sibling.name || "Unnamed"}</span>
                      {sibling.age && <span className="text-muted-foreground"> ({sibling.age} yrs)</span>}
                      {sibling.occupation && <span className="text-muted-foreground uppercase"> - {sibling.occupation}</span>}
                      <span className="text-muted-foreground">
                        {" "}
                        - {sibling.sameHousehold ? "Same household" : "Not same household"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
          )}
          </Card>
        )}

        {/* Guardian */}
        {showSection("guardian") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Guardian</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium uppercase">{formValues.guardianName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Relationship</p>
              <p className="font-medium uppercase">
                {formValues.guardianRelationship || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact</p>
              <p className="font-medium">
                {formValues.guardianContact || "Not provided"}
              </p>
            </div>
          </div>
          </Card>
        )}

        {/* Benefactor */}
        {showSection("benefactor") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Benefactor</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium uppercase">{formValues.benefactorName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Relationship</p>
              <p className="font-medium uppercase">
                {formValues.benefactorRelationship || "Not provided"}
              </p>
            </div>
          </div>
          </Card>
        )}

        {/* Skills */}
        {showSection("skills") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Skills</h3>
          <p className="text-sm font-medium uppercase">{formatSkills()}</p>
          </Card>
        )}

        {/* SPES Information */}
        {showSection("spes-info") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">SPES Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">4Ps Beneficiary</p>
              <p className="font-medium">
                {formValues.isFourPsBeneficiary ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Application Year</p>
              <p className="font-medium">
                {formValues.applicationYear || "Not provided"}
              </p>
            </div>
          </div>
          {formValues.motivation && (
            <div className="mt-2">
              <p className="text-muted-foreground text-sm">Motivation</p>
              <p className="text-sm font-medium uppercase">{formValues.motivation}</p>
            </div>
          )}
          </Card>
        )}

        {/* Documents */}
        {showSection("documents") && (
          <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Documents</h3>
          {uploadedDocumentEntries.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
              {/* Left Side: List */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required</h4>
                  {requiredUploadedDocuments.map(([documentId, document]) => (
                    <button
                      key={documentId}
                      type="button"
                      onClick={() => setSelectedDocumentId(documentId)}
                      className={`flex w-full items-center justify-between rounded-md border p-2.5 text-left text-sm transition-colors ${
                        activeSelectedDocumentId === documentId
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {DOCUMENT_LABELS[documentId] || documentId}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {document.fileName || "Uploaded file"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {optionalUploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Optional</h4>
                    {optionalUploadedDocuments.map(([documentId, document]) => (
                      <button
                        key={documentId}
                        type="button"
                        onClick={() => setSelectedDocumentId(documentId)}
                        className={`flex w-full items-center justify-between rounded-md border p-2.5 text-left text-sm transition-colors ${
                          activeSelectedDocumentId === documentId
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "bg-background hover:bg-muted/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {DOCUMENT_LABELS[documentId] || documentId}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {document.fileName || "Uploaded file"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Preview */}
              <div className="relative min-h-[400px] rounded-lg border bg-background/50 overflow-hidden">
                {selectedDocument ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {DOCUMENT_LABELS[activeSelectedDocumentId] || activeSelectedDocumentId}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedDocument.fileName}
                        </p>
                      </div>
                      {selectedDocument.url && (
                        <a
                          href={selectedDocument.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:underline bg-primary/5 rounded-md"
                        >
                          Open Original
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex-1 p-0 overflow-auto">
                      {selectedDocument.fileType === "application/pdf" ? (
                        <iframe
                          src={selectedDocument.url}
                          title={selectedDocument.fileName || activeSelectedDocumentId}
                          className="w-full h-full min-h-[500px]"
                        />
                      ) : selectedDocument.fileType?.startsWith("image/") ? (
                        <div className="flex items-center justify-center min-h-[400px] p-4">
                          <img
                            src={selectedDocument.url}
                            alt={selectedDocument.fileName || activeSelectedDocumentId}
                            className="max-w-full max-h-[600px] rounded shadow-sm object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                          <p>Preview unavailable for this file type.</p>
                          <p className="text-xs mt-1">Please use the "Open Original" button above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground italic">
                    Select a document from the list to preview
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic bg-background/50 p-4 rounded-md border border-dashed">
              No documents uploaded yet.
            </p>
          )}
          </Card>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6 flex justify-end">
        <Button
          type="button"
          onClick={handleSubmitClick}
          disabled={isPending || !isValid}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
        {!isValid && (
          <div className="mt-4 p-4 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded border border-red-200 dark:border-red-900 leading-relaxed">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-base">Cannot Submit - Missing Information</p>
              {triggerValidation && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="bg-red-100/50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/80 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  onClick={() => {
                    triggerValidation().then(() => {
                      if (!isValid) console.log("Missing fields triggered. Check UI below.");
                    });
                  }}
                >
                  Scan for Errors
                </Button>
              )}
            </div>
            
            {incompleteSections && incompleteSections.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-1">Please return and complete these sections:</p>
                <ul className="list-disc pl-5 opacity-90 space-y-1">
                  {incompleteSections.map((section) => (
                    <li key={section}>{section}</li>
                  ))}
                </ul>
              </div>
            )}

            {errors && Object.keys(errors).length > 0 && (
              <div>
                <p className="font-medium mb-1">Specific field errors:</p>
                <ul className="list-disc pl-5 opacity-90">
                  {Object.entries(errors).map(([key, err]: [string, any]) => (
                    <li key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: {err?.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this SPES application? Please make
              sure all the information you provided is accurate and complete.
              You may not be able to edit your application after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isPending}>
              {isPending ? "Submitting..." : "Yes, Submit Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewSection;
