import React, { useState } from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Spinner } from "@/ui/spinner";
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

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formValues,
  isPending,
  isValid,
  onSubmitRequest,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  return (
    <div id="review" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Review Application</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Information */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Legal Name</p>
              <p className="font-medium">{formatName()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">
                {formValues.profileRole || "Not provided"}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Details */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Birthdate</p>
              <p className="font-medium">
                {formValues.profileBirthdate || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">
                {formValues.profileAge || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Sex</p>
              <p className="font-medium">
                {formValues.profileSex || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Civil Status</p>
              <p className="font-medium">
                {formValues.profileCivilStatus || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Religion</p>
              <p className="font-medium">
                {formValues.profileReligion || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Languages</p>
              <p className="font-medium">{formatLanguages()}</p>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Address</h3>
          <p className="text-sm font-medium">{formatAddress()}</p>
        </Card>

        {/* Education */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Education</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Grade/Year Level</p>
              <p className="font-medium">
                {formValues.gradeYear || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">School Name</p>
              <p className="font-medium">
                {formValues.schoolName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Track/Course</p>
              <p className="font-medium">
                {formValues.trackCourse || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">School Year</p>
              <p className="font-medium">
                {formValues.schoolYear || "Not provided"}
              </p>
            </div>
          </div>
        </Card>

        {/* Family Information */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Family Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Father</p>
              <p className="font-medium">
                {formValues.fatherName || "Not provided"}
              </p>
              {formValues.fatherOccupation && (
                <p className="text-xs text-muted-foreground">
                  {formValues.fatherOccupation}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Mother</p>
              <p className="font-medium">
                {formValues.motherMaidenName || "Not provided"}
              </p>
              {formValues.motherOccupation && (
                <p className="text-xs text-muted-foreground">
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
                    <span className="font-medium">{sibling.name || "Unnamed"}</span>
                    {sibling.age && <span className="text-muted-foreground"> ({sibling.age} yrs)</span>}
                    {sibling.occupation && <span className="text-muted-foreground"> - {sibling.occupation}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Guardian */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Guardian</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{formValues.guardianName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Relationship</p>
              <p className="font-medium">
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

        {/* Skills */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Skills</h3>
          <p className="text-sm font-medium">{formatSkills()}</p>
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

        {/* SPES Information */}
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
              <p className="text-sm font-medium">{formValues.motivation}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
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
          <p className="mt-2 text-sm text-muted-foreground">
            Please complete all required fields before submitting.
          </p>
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
