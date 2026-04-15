"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FieldFeedback,
  DocumentFeedback,
} from "@/lib/validations/application-review";

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  profileLastName: "Last Name",
  profileFirstName: "First Name",
  profileMiddleName: "Middle Name",
  profileSuffix: "Suffix",
  profileBirthdate: "Birthdate",
  profileAge: "Age",
  profilePlaceOfBirth: "Place of Birth",
  profileSex: "Sex",
  profileHeight: "Height",
  profileCivilStatus: "Civil Status",
  profileReligion: "Religion",
  profileEmail: "Email",
  profileContact: "Contact",
  profileFacebook: "Facebook",
  profileDisability: "Disability",
  profilePwdId: "PWD ID",
  profileHouseStreet: "House/Street",
  profileBarangay: "Barangay",
  profileMunicipality: "Municipality",
  profileProvince: "Province",
  fatherName: "Father's Name",
  fatherOccupation: "Father's Occupation",
  fatherContact: "Father's Contact",
  motherMaidenName: "Mother's Name",
  motherOccupation: "Mother's Occupation",
  motherContact: "Mother's Contact",
  numberOfSiblings: "Number of Siblings",
  guardianName: "Guardian Name",
  guardianContact: "Guardian Contact",
  guardianAddress: "Guardian Address",
  guardianAge: "Guardian Age",
  guardianOccupation: "Guardian Occupation",
  guardianRelationship: "Guardian Relationship",
  benefactorName: "Benefactor Name",
  benefactorRelationship: "Benefactor Relationship",
  gradeYear: "Grade/Year Level",
  schoolName: "School Name",
  trackCourse: "Track/Course",
  schoolYear: "School Year",
  isFourPsBeneficiary: "4Ps Beneficiary",
  applicationYear: "Application Year",
  motivation: "Motivation",
  remarks: "Remarks",
};

const SECTION_LABELS: Record<string, string> = {
  "basic-info": "Basic Information",
  "personal-details": "Personal Details",
  address: "Address",
  family: "Family Information",
  guardian: "Guardian Information",
  benefactor: "Benefactor Information",
  education: "Education",
  spes: "SPES Information",
};

const DOCUMENT_LABELS: Record<string, string> = {
  psaCertificate: "PSA Birth Certificate",
  schoolId: "School ID / Certificate of Enrollment",
  grades: "Report Card / Grades",
  barangayCertificate: "Barangay Certificate of Indigency",
  fourPsId: "4Ps ID",
  medicalCertificate: "Medical Certificate",
};

interface FeedbackDisplayProps {
  fieldFeedback: FieldFeedback[];
  documentFeedback: DocumentFeedback[];
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  fieldFeedback,
  documentFeedback,
}) => {
  // Group field feedback by section
  const groupedFieldFeedback = fieldFeedback.reduce((acc, feedback) => {
    if (!acc[feedback.sectionId]) {
      acc[feedback.sectionId] = [];
    }
    acc[feedback.sectionId].push(feedback);
    return acc;
  }, {} as Record<string, FieldFeedback[]>);

  const invalidFieldCount = fieldFeedback.filter((f) => f.status === "invalid").length;
  const invalidDocCount = documentFeedback.filter(
    (f) => f.status === "invalid" || f.status === "missing"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      {(invalidFieldCount > 0 || invalidDocCount > 0) && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">
                Issues Found in Your Application
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                {invalidFieldCount > 0 && (
                  <span>{invalidFieldCount} field(s) need correction. </span>
                )}
                {invalidDocCount > 0 && (
                  <span>{invalidDocCount} document(s) have issues. </span>
                )}
                Please review the feedback below and make the necessary changes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Field Feedback */}
      {Object.keys(groupedFieldFeedback).length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Field Feedback</h3>
          <div className="space-y-4">
            {Object.entries(groupedFieldFeedback).map(([sectionId, feedbacks]) => (
              <Card key={sectionId} className="p-4">
                <h4 className="font-medium mb-3">
                  {SECTION_LABELS[sectionId] || sectionId}
                </h4>
                <div className="space-y-2">
                  {feedbacks.map((feedback, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        feedback.status === "valid"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      {feedback.status === "valid" ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={cn(
                            "font-medium text-sm",
                            feedback.status === "valid"
                              ? "text-green-800 dark:text-green-300"
                              : "text-red-800 dark:text-red-300"
                          )}
                        >
                          {FIELD_LABELS[feedback.fieldName] || feedback.fieldName}
                        </p>
                        {feedback.comment && (
                          <p
                            className={cn(
                              "text-sm mt-1",
                              feedback.status === "valid"
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            )}
                          >
                            {feedback.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Document Feedback */}
      {documentFeedback.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Document Verification</h3>
          <Card className="p-4">
            <div className="space-y-3">
              {documentFeedback.map((feedback, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    feedback.status === "valid"
                      ? "bg-green-50 dark:bg-green-950/30"
                      : feedback.status === "invalid"
                      ? "bg-red-50 dark:bg-red-950/30"
                      : "bg-orange-50 dark:bg-orange-950/30"
                  )}
                >
                  {feedback.status === "valid" ? (
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  ) : feedback.status === "invalid" ? (
                    <X className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={cn(
                        "font-medium text-sm",
                        feedback.status === "valid"
                          ? "text-green-800 dark:text-green-300"
                          : feedback.status === "invalid"
                          ? "text-red-800 dark:text-red-300"
                          : "text-orange-800 dark:text-orange-300"
                      )}
                    >
                      {DOCUMENT_LABELS[feedback.documentType] || feedback.documentType}
                      {feedback.status === "missing" && " (Missing)"}
                    </p>
                    {feedback.comment && (
                      <p
                        className={cn(
                          "text-sm mt-1",
                          feedback.status === "valid"
                            ? "text-green-700 dark:text-green-400"
                            : feedback.status === "invalid"
                            ? "text-red-700 dark:text-red-400"
                            : "text-orange-700 dark:text-orange-400"
                        )}
                      >
                        {feedback.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* No feedback */}
      {fieldFeedback.length === 0 && documentFeedback.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No detailed feedback available for this review.
        </Card>
      )}
    </div>
  );
};

export default FeedbackDisplay;
