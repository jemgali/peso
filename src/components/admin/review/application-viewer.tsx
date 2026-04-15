"use client";

import React, { useState } from "react";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Check, X, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import type { ApplicationDetailResponse, FieldFeedback } from "@/lib/validations/application-review";

interface ApplicationViewerProps {
  data: NonNullable<ApplicationDetailResponse["data"]>;
  fieldFeedback: FieldFeedback[];
  onFieldFeedbackChange: (feedback: FieldFeedback[]) => void;
  isReviewable?: boolean;
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

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
};

// Reviewable field — shows label with check/cross/comment controls, then value below
interface ReviewableFieldProps {
  label: string;
  fieldName: string;
  sectionId: string;
  value: string | number | boolean | null | undefined;
  fieldFeedback: FieldFeedback[];
  onFieldFeedbackChange: (feedback: FieldFeedback[]) => void;
  isReviewable?: boolean;
}

const ReviewableField: React.FC<ReviewableFieldProps> = ({
  label,
  fieldName,
  sectionId,
  value,
  fieldFeedback,
  onFieldFeedbackChange,
  isReviewable = true,
}) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Get current feedback for this field
  const currentFeedback = fieldFeedback.find(
    (f) => f.fieldName === fieldName && f.sectionId === sectionId
  );

  const displayValue =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value ? "Yes" : "No"
        : String(value);

  const setFeedbackStatus = (status: "valid" | "invalid") => {
    const updated = fieldFeedback.filter(
      (f) => !(f.fieldName === fieldName && f.sectionId === sectionId)
    );
    // If clicking the same status, toggle it off
    if (currentFeedback?.status === status) {
      onFieldFeedbackChange(updated);
    } else {
      updated.push({
        sectionId,
        fieldName,
        status,
        comment: currentFeedback?.comment,
      });
      onFieldFeedbackChange(updated);
    }
  };

  const saveComment = () => {
    const updated = fieldFeedback.filter(
      (f) => !(f.fieldName === fieldName && f.sectionId === sectionId)
    );
    updated.push({
      sectionId,
      fieldName,
      status: currentFeedback?.status || "invalid",
      comment: commentText || undefined,
    });
    onFieldFeedbackChange(updated);
    setCommentOpen(false);
  };

  // Initialize comment text when popover opens
  const handleCommentOpen = (open: boolean) => {
    if (open) {
      setCommentText(currentFeedback?.comment || "");
    }
    setCommentOpen(open);
  };

  return (
    <div className={cn(
      "rounded-lg p-3 transition-colors",
      currentFeedback?.status === "valid" && "bg-green-50/50 dark:bg-green-950/10",
      currentFeedback?.status === "invalid" && "bg-red-50/50 dark:bg-red-950/10",
    )}>
      {/* Label row with review controls */}
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm text-muted-foreground flex-1">{label}</p>
        {isReviewable && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                currentFeedback?.status === "valid" && "text-green-600 bg-green-100 dark:bg-green-900/50"
              )}
              onClick={() => setFeedbackStatus("valid")}
              title="Mark as valid"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                currentFeedback?.status === "invalid" && "text-red-600 bg-red-100 dark:bg-red-900/50"
              )}
              onClick={() => setFeedbackStatus("invalid")}
              title="Mark as invalid"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Popover open={commentOpen} onOpenChange={handleCommentOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6",
                    currentFeedback?.comment && "text-blue-600 bg-blue-100 dark:bg-blue-900/50"
                  )}
                  title="Add comment"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Comment for {label}</p>
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add feedback comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveComment();
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveComment}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      {/* Value */}
      <p className="font-medium">{displayValue}</p>
      {/* Show comment if exists */}
      {currentFeedback?.comment && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
          💬 {currentFeedback.comment}
        </p>
      )}
    </div>
  );
};

const ApplicationViewer: React.FC<ApplicationViewerProps> = ({
  data,
  fieldFeedback,
  onFieldFeedbackChange,
  isReviewable = true,
}) => {
  const { profile, personal, address, family, guardian, benefactor, education, skills, spes } = data;

  const rf = (label: string, fieldName: string, sectionId: string, value: string | number | boolean | null | undefined) => (
    <ReviewableField
      label={label}
      fieldName={fieldName}
      sectionId={sectionId}
      value={value}
      fieldFeedback={fieldFeedback}
      onFieldFeedbackChange={onFieldFeedbackChange}
      isReviewable={isReviewable}
    />
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Section title="Basic Information">
        {rf("Last Name", "profileLastName", "basic-info", profile.profileLastName)}
        {rf("First Name", "profileFirstName", "basic-info", profile.profileFirstName)}
        {rf("Middle Name", "profileMiddleName", "basic-info", profile.profileMiddleName)}
        {rf("Suffix", "profileSuffix", "basic-info", profile.profileSuffix)}
        {rf("Email", "profileEmail", "basic-info", profile.profileEmail)}
      </Section>

      {/* Personal Details */}
      {personal && (
        <Section title="Personal Details">
          {rf("Birthdate", "profileBirthdate", "personal-details", formatDate(personal.profileBirthdate as string | null))}
          {rf("Age", "profileAge", "personal-details", personal.profileAge as number | null)}
          {rf("Place of Birth", "profilePlaceOfBirth", "personal-details", personal.profilePlaceOfBirth as string | null)}
          {rf("Sex", "profileSex", "personal-details", personal.profileSex as string | null)}
          {rf("Height (cm)", "profileHeight", "personal-details", personal.profileHeight as number | null)}
          {rf("Civil Status", "profileCivilStatus", "personal-details", personal.profileCivilStatus as string | null)}
          {rf("Religion", "profileReligion", "personal-details", personal.profileReligion as string | null)}
          {rf("Contact", "profileContact", "personal-details", personal.profileContact as string | null)}
          {rf("Facebook", "profileFacebook", "personal-details", personal.profileFacebook as string | null)}
          {rf("Disability", "profileDisability", "personal-details", personal.profileDisability as string | null)}
          {rf("PWD ID", "profilePwdId", "personal-details", personal.profilePwdId as string | null)}
        </Section>
      )}

      {/* Address */}
      {address && (
        <Section title="Address">
          {rf("House/Street", "profileHouseStreet", "address", address.profileHouseStreet as string | null)}
          {rf("Barangay", "profileBarangay", "address", address.profileBarangay as string | null)}
          {rf("Municipality", "profileMunicipality", "address", address.profileMunicipality as string | null)}
          {rf("Province", "profileProvince", "address", address.profileProvince as string | null)}
        </Section>
      )}

      {/* Family Information */}
      {family && (
        <Section title="Family Information">
          {rf("Father's Name", "fatherName", "family", family.fatherName as string | null)}
          {rf("Father's Occupation", "fatherOccupation", "family", family.fatherOccupation as string | null)}
          {rf("Father's Contact", "fatherContact", "family", family.fatherContact as string | null)}
          {rf("Mother's Maiden Name", "motherMaidenName", "family", family.motherMaidenName as string | null)}
          {rf("Mother's Occupation", "motherOccupation", "family", family.motherOccupation as string | null)}
          {rf("Mother's Contact", "motherContact", "family", family.motherContact as string | null)}
          {rf("Number of Siblings", "numberOfSiblings", "family", family.numberOfSiblings as number | null)}
        </Section>
      )}

      {/* Guardian Information */}
      {guardian && (
        <Section title="Guardian Information">
          {rf("Guardian Name", "guardianName", "guardian", guardian.guardianName as string | null)}
          {rf("Guardian Contact", "guardianContact", "guardian", guardian.guardianContact as string | null)}
          {rf("Guardian Address", "guardianAddress", "guardian", guardian.guardianAddress as string | null)}
          {rf("Guardian Age", "guardianAge", "guardian", guardian.guardianAge as number | null)}
          {rf("Guardian Occupation", "guardianOccupation", "guardian", guardian.guardianOccupation as string | null)}
          {rf("Relationship", "guardianRelationship", "guardian", guardian.guardianRelationship as string | null)}
        </Section>
      )}

      {/* Benefactor Information */}
      {benefactor && (
        <Section title="Benefactor Information">
          {rf("Benefactor Name", "benefactorName", "benefactor", benefactor.benefactorName as string | null)}
          {rf("Relationship", "benefactorRelationship", "benefactor", benefactor.benefactorRelationship as string | null)}
        </Section>
      )}

      {/* Education */}
      {education && (
        <Section title="Education">
          {rf("Grade/Year Level", "gradeYear", "education", education.gradeYear as string | null)}
          {rf("School Name", "schoolName", "education", education.schoolName as string | null)}
          {rf("Track/Course", "trackCourse", "education", education.trackCourse as string | null)}
          {rf("School Year", "schoolYear", "education", education.schoolYear as string | null)}
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

      {/* SPES Information */}
      {spes && (
        <Section title="SPES Information">
          {rf("4Ps Beneficiary", "isFourPsBeneficiary", "spes", spes.isFourPsBeneficiary as boolean | null)}
          {rf("Application Year", "applicationYear", "spes", spes.applicationYear as number | null)}
          <div className="col-span-2">
            {rf("Motivation", "motivation", "spes", spes.motivation as string | null)}
          </div>
        </Section>
      )}
    </div>
  );
};

export default ApplicationViewer;
