"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationDetailResponse } from "@/lib/validations/application-review";

// Document type labels for display in the viewer
const DOCUMENT_LABELS: Record<string, { name: string; required: boolean }> = {
  psaCertificate: { name: "Original PSA Certificate", required: true },
  grades: { name: "Grades", required: true },
  affidavitLowIncome: { name: "Affidavit of Low Income (PAO)", required: true },
  barangayCertLowIncome: { name: "Barangay Certificate of Low Income (Parents)", required: true },
  barangayCertResidency: { name: "Barangay Certificate of Residency (Applicant)", required: true },
  incomeTaxReturn: { name: "Income Tax Return", required: true },
  affidavitSoloParent: { name: "Affidavit of Solo Parent", required: false },
  affidavitDiscrepancy: { name: "Affidavit of Discrepancy", required: false },
  deathCertificate: { name: "Death Certificate (if parent/s deceased)", required: false },
};

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

interface ApplicationViewerProps {
  data: NonNullable<ApplicationDetailResponse["data"]>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Card className="p-4">
    <h3 className="font-semibold mb-3 text-lg">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </Card>
);

interface FieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

const Field: React.FC<FieldProps> = ({ label, value }) => {
  let displayValue: string;
  
  if (value === null || value === undefined || value === "") {
    displayValue = "—";
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else {
    displayValue = String(value);
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{displayValue}</p>
    </div>
  );
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
};

const ApplicationViewer: React.FC<ApplicationViewerProps> = ({ data }) => {
  const { profile, personal, address, family, guardian, benefactor, education, skills, documents, spes } = data;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Section title="Basic Information">
        <Field label="Last Name" value={profile.profileLastName} />
        <Field label="First Name" value={profile.profileFirstName} />
        <Field label="Middle Name" value={profile.profileMiddleName} />
        <Field label="Suffix" value={profile.profileSuffix} />
        <Field label="Email" value={profile.profileEmail} />
        <Field label="Role" value={profile.profileRole} />
      </Section>

      {/* Personal Details */}
      {personal && (
        <Section title="Personal Details">
          <Field 
            label="Birthdate" 
            value={formatDate(personal.profileBirthdate as string | null)} 
          />
          <Field label="Age" value={personal.profileAge as number | null} />
          <Field label="Place of Birth" value={personal.profilePlaceOfBirth as string | null} />
          <Field label="Sex" value={personal.profileSex as string | null} />
          <Field label="Height (cm)" value={personal.profileHeight as number | null} />
          <Field label="Civil Status" value={personal.profileCivilStatus as string | null} />
          <Field label="Religion" value={personal.profileReligion as string | null} />
          <Field label="Contact" value={personal.profileContact as string | null} />
          <Field label="Facebook" value={personal.profileFacebook as string | null} />
          <Field label="Disability" value={personal.profileDisability as string | null} />
          <Field label="PWD ID" value={personal.profilePwdId as string | null} />
        </Section>
      )}

      {/* Address */}
      {address && (
        <Section title="Address">
          <Field label="House/Street" value={address.profileHouseStreet as string | null} />
          <Field label="Barangay" value={address.profileBarangay as string | null} />
          <Field label="Municipality" value={address.profileMunicipality as string | null} />
          <Field label="Province" value={address.profileProvince as string | null} />
        </Section>
      )}

      {/* Family Information */}
      {family && (
        <Section title="Family Information">
          <Field label="Father's Name" value={family.fatherName as string | null} />
          <Field label="Father's Occupation" value={family.fatherOccupation as string | null} />
          <Field label="Father's Contact" value={family.fatherContact as string | null} />
          <Field label="Mother's Maiden Name" value={family.motherMaidenName as string | null} />
          <Field label="Mother's Occupation" value={family.motherOccupation as string | null} />
          <Field label="Mother's Contact" value={family.motherContact as string | null} />
          <Field label="Number of Siblings" value={family.numberOfSiblings as number | null} />
        </Section>
      )}

      {/* Guardian Information */}
      {guardian && (
        <Section title="Guardian Information">
          <Field label="Guardian Name" value={guardian.guardianName as string | null} />
          <Field label="Guardian Contact" value={guardian.guardianContact as string | null} />
          <Field label="Guardian Address" value={guardian.guardianAddress as string | null} />
          <Field label="Guardian Age" value={guardian.guardianAge as number | null} />
          <Field label="Guardian Occupation" value={guardian.guardianOccupation as string | null} />
          <Field label="Relationship" value={guardian.guardianRelationship as string | null} />
        </Section>
      )}

      {/* Benefactor Information */}
      {benefactor && (
        <Section title="Benefactor Information">
          <Field label="Benefactor Name" value={benefactor.benefactorName as string | null} />
          <Field label="Relationship" value={benefactor.benefactorRelationship as string | null} />
        </Section>
      )}

      {/* Education */}
      {education && (
        <Section title="Education">
          <Field label="Grade/Year Level" value={education.gradeYear as string | null} />
          <Field label="School Name" value={education.schoolName as string | null} />
          <Field label="Track/Course" value={education.trackCourse as string | null} />
          <Field label="School Year" value={education.schoolYear as string | null} />
        </Section>
      )}

      {/* Skills */}
      {skills && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-lg">Skills</h3>
          {Array.isArray(skills.skills) && skills.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(skills.skills as string[]).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills listed</p>
          )}
        </Card>
      )}

      {/* Documents */}
      {documents && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-lg">Uploaded Documents</h3>
          {(() => {
            const docs = (documents as Record<string, unknown>).documents as Record<string, DocumentEntry> | undefined;
            if (!docs || Object.keys(docs).length === 0) {
              return <p className="text-muted-foreground">No documents uploaded</p>;
            }

            // Show all document types, marking uploaded vs not uploaded
            const allDocTypes = Object.keys(DOCUMENT_LABELS);
            return (
              <div className="space-y-2">
                {allDocTypes.map((docType) => {
                  const doc = docs[docType];
                  const label = DOCUMENT_LABELS[docType];
                  return (
                    <div
                      key={docType}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        doc
                          ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                          : label.required
                            ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                            : "border-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded",
                          doc ? "bg-green-100 dark:bg-green-900/50" : "bg-muted"
                        )}>
                          {doc ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{label.name}</span>
                            {label.required ? (
                              <Badge variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                Required
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                If Applicable
                              </Badge>
                            )}
                          </div>
                          {doc && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.fileName} ({formatFileSize(doc.fileSize)}) — Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                          {!doc && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {label.required ? "Not yet uploaded" : "Not submitted"}
                            </p>
                          )}
                        </div>
                      </div>
                      {doc && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>
      )}

      {/* SPES Information */}
      {spes && (
        <Section title="SPES Information">
          <Field label="4Ps Beneficiary" value={spes.isFourPsBeneficiary as boolean | null} />
          <Field label="Application Year" value={spes.applicationYear as number | null} />
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Motivation</p>
            <p className="font-medium whitespace-pre-wrap">
              {(spes.motivation as string | null) || "—"}
            </p>
          </div>
        </Section>
      )}
    </div>
  );
};

export default ApplicationViewer;
