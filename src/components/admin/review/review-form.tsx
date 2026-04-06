"use client";

import React, { useState } from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";

import { Check, X, AlertCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FieldFeedback,
  FieldFeedbackStatus,
} from "@/lib/validations/application-review";

// Field definitions for each section
const SECTION_FIELDS: Record<
  string,
  { id: string; label: string; fieldName: string }[]
> = {
  "basic-info": [
    { id: "lastName", label: "Last Name", fieldName: "profileLastName" },
    { id: "firstName", label: "First Name", fieldName: "profileFirstName" },
    { id: "middleName", label: "Middle Name", fieldName: "profileMiddleName" },
    { id: "suffix", label: "Suffix", fieldName: "profileSuffix" },
    { id: "role", label: "Role", fieldName: "profileRole" },
  ],
  "personal-details": [
    { id: "birthdate", label: "Birthdate", fieldName: "profileBirthdate" },
    { id: "age", label: "Age", fieldName: "profileAge" },
    { id: "placeOfBirth", label: "Place of Birth", fieldName: "profilePlaceOfBirth" },
    { id: "sex", label: "Sex", fieldName: "profileSex" },
    { id: "height", label: "Height", fieldName: "profileHeight" },
    { id: "civilStatus", label: "Civil Status", fieldName: "profileCivilStatus" },
    { id: "religion", label: "Religion", fieldName: "profileReligion" },
    { id: "email", label: "Email", fieldName: "profileEmail" },
    { id: "contact", label: "Contact", fieldName: "profileContact" },
    { id: "facebook", label: "Facebook", fieldName: "profileFacebook" },
    { id: "disability", label: "Disability", fieldName: "profileDisability" },
    { id: "pwdId", label: "PWD ID", fieldName: "profilePwdId" },
  ],
  address: [
    { id: "houseStreet", label: "House/Street", fieldName: "profileHouseStreet" },
    { id: "barangay", label: "Barangay", fieldName: "profileBarangay" },
    { id: "municipality", label: "Municipality", fieldName: "profileMunicipality" },
    { id: "province", label: "Province", fieldName: "profileProvince" },
  ],
  family: [
    { id: "fatherName", label: "Father's Name", fieldName: "fatherName" },
    { id: "fatherOccupation", label: "Father's Occupation", fieldName: "fatherOccupation" },
    { id: "fatherContact", label: "Father's Contact", fieldName: "fatherContact" },
    { id: "motherName", label: "Mother's Name", fieldName: "motherMaidenName" },
    { id: "motherOccupation", label: "Mother's Occupation", fieldName: "motherOccupation" },
    { id: "motherContact", label: "Mother's Contact", fieldName: "motherContact" },
    { id: "siblings", label: "Number of Siblings", fieldName: "numberOfSiblings" },
  ],
  guardian: [
    { id: "guardianName", label: "Guardian Name", fieldName: "guardianName" },
    { id: "guardianContact", label: "Guardian Contact", fieldName: "guardianContact" },
    { id: "guardianAddress", label: "Guardian Address", fieldName: "guardianAddress" },
    { id: "guardianAge", label: "Guardian Age", fieldName: "guardianAge" },
    { id: "guardianOccupation", label: "Guardian Occupation", fieldName: "guardianOccupation" },
    { id: "guardianRelationship", label: "Relationship", fieldName: "guardianRelationship" },
  ],
  benefactor: [
    { id: "benefactorName", label: "Benefactor Name", fieldName: "benefactorName" },
    { id: "benefactorRelationship", label: "Relationship", fieldName: "benefactorRelationship" },
  ],
  education: [
    { id: "gradeYear", label: "Grade/Year Level", fieldName: "gradeYear" },
    { id: "schoolName", label: "School Name", fieldName: "schoolName" },
    { id: "trackCourse", label: "Track/Course", fieldName: "trackCourse" },
    { id: "schoolYear", label: "School Year", fieldName: "schoolYear" },
  ],
  spes: [
    { id: "fourPs", label: "4Ps Beneficiary", fieldName: "isFourPsBeneficiary" },
    { id: "applicationYear", label: "Application Year", fieldName: "applicationYear" },
    { id: "motivation", label: "Motivation", fieldName: "motivation" },
    { id: "remarks", label: "Remarks", fieldName: "remarks" },
  ],
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

interface FieldFeedbackInputProps {
  sectionId: string;
  fieldName: string;
  label: string;
  feedback: FieldFeedback | undefined;
  onFeedbackChange: (feedback: FieldFeedback) => void;
  onFeedbackRemove: () => void;
}

const FieldFeedbackInput: React.FC<FieldFeedbackInputProps> = ({
  sectionId,
  fieldName,
  label,
  feedback,
  onFeedbackChange,
  onFeedbackRemove,
}) => {
  const [showComment, setShowComment] = useState(!!feedback?.comment);

  const handleStatusChange = (status: FieldFeedbackStatus) => {
    onFeedbackChange({
      sectionId,
      fieldName,
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

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={feedback?.status === "valid" ? "default" : "outline"}
            className={cn(
              "h-8 w-8 p-0",
              feedback?.status === "valid" && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleStatusChange("valid")}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedback?.status === "invalid" ? "default" : "outline"}
            className={cn(
              "h-8 w-8 p-0",
              feedback?.status === "invalid" && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => handleStatusChange("invalid")}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setShowComment(!showComment)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          {feedback && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={onFeedbackRemove}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {showComment && (
        <Textarea
          placeholder="Add a comment for this field..."
          value={feedback?.comment || ""}
          onChange={(e) => handleCommentChange(e.target.value)}
          rows={2}
          className="text-sm"
        />
      )}
    </div>
  );
};

interface ReviewFormProps {
  fieldFeedback: FieldFeedback[];
  onFieldFeedbackChange: (feedback: FieldFeedback[]) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  fieldFeedback,
  onFieldFeedbackChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getFeedbackForField = (sectionId: string, fieldName: string) => {
    return fieldFeedback.find(
      (f) => f.sectionId === sectionId && f.fieldName === fieldName
    );
  };

  const handleFeedbackChange = (feedback: FieldFeedback) => {
    const existing = fieldFeedback.findIndex(
      (f) => f.sectionId === feedback.sectionId && f.fieldName === feedback.fieldName
    );

    if (existing >= 0) {
      const newFeedback = [...fieldFeedback];
      newFeedback[existing] = feedback;
      onFieldFeedbackChange(newFeedback);
    } else {
      onFieldFeedbackChange([...fieldFeedback, feedback]);
    }
  };

  const handleFeedbackRemove = (sectionId: string, fieldName: string) => {
    onFieldFeedbackChange(
      fieldFeedback.filter(
        (f) => !(f.sectionId === sectionId && f.fieldName === fieldName)
      )
    );
  };

  const getSectionStats = (sectionId: string) => {
    const fields = SECTION_FIELDS[sectionId] || [];
    const validCount = fields.filter(
      (f) => getFeedbackForField(sectionId, f.fieldName)?.status === "valid"
    ).length;
    const invalidCount = fields.filter(
      (f) => getFeedbackForField(sectionId, f.fieldName)?.status === "invalid"
    ).length;
    return { validCount, invalidCount, total: fields.length };
  };

  // Mark all fields in a section as valid
  const markAllValid = (sectionId: string) => {
    const fields = SECTION_FIELDS[sectionId] || [];
    const newFeedback = [...fieldFeedback];

    fields.forEach((field) => {
      const existingIdx = newFeedback.findIndex(
        (f) => f.sectionId === sectionId && f.fieldName === field.fieldName
      );

      const feedback: FieldFeedback = {
        sectionId,
        fieldName: field.fieldName,
        status: "valid",
      };

      if (existingIdx >= 0) {
        newFeedback[existingIdx] = { ...newFeedback[existingIdx], status: "valid" };
      } else {
        newFeedback.push(feedback);
      }
    });

    onFieldFeedbackChange(newFeedback);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>
          Click on each section to expand and provide feedback on individual fields.
          Use <Check className="h-3 w-3 inline text-green-600" /> for valid and{" "}
          <X className="h-3 w-3 inline text-red-600" /> for invalid fields.
        </span>
      </div>

      {Object.entries(SECTION_FIELDS).map(([sectionId, fields]) => {
        const isExpanded = expandedSections.has(sectionId);
        const stats = getSectionStats(sectionId);

        return (
          <Card key={sectionId} className="overflow-hidden">
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(sectionId)}
            >
              <span className="font-medium">{SECTION_LABELS[sectionId]}</span>
              <div className="flex items-center gap-3">
                {stats.validCount > 0 && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {stats.validCount}
                  </span>
                )}
                {stats.invalidCount > 0 && (
                  <span className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {stats.invalidCount}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {stats.validCount + stats.invalidCount}/{stats.total}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => markAllValid(sectionId)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark All Valid
                  </Button>
                </div>
                {fields.map((field) => (
                  <FieldFeedbackInput
                    key={field.id}
                    sectionId={sectionId}
                    fieldName={field.fieldName}
                    label={field.label}
                    feedback={getFeedbackForField(sectionId, field.fieldName)}
                    onFeedbackChange={handleFeedbackChange}
                    onFeedbackRemove={() =>
                      handleFeedbackRemove(sectionId, field.fieldName)
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ReviewForm;
