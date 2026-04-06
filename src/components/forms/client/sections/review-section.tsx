import React from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Spinner } from "@/ui/spinner";
import type { ReviewSectionProps } from "./types";

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formValues,
  isPending,
  isValid,
  setSectionRef,
}) => {
  return (
    <div
      id="review"
      ref={setSectionRef("review")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Review Application</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Legal Name</p>
              <p className="font-medium">
                {[
                  formValues.firstName,
                  formValues.middleName,
                  formValues.lastName,
                  formValues.suffix,
                ]
                  .filter(Boolean)
                  .join(" ") || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">
                {formValues.profileRole || "Not provided"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Birthdate</p>
              <p className="font-medium">
                {formValues.birthdate || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">
                {formValues.age || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Place of Birth</p>
              <p className="font-medium">
                {formValues.placeOfBirth || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Sex</p>
              <p className="font-medium">
                {formValues.sex || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Height</p>
              <p className="font-medium">
                {formValues.height ? `${formValues.height} cm` : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Civil Status</p>
              <p className="font-medium">
                {formValues.civilStatus || "Not provided"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Address</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Present Address</p>
              <p className="font-medium">
                {formValues.presentAddress || "Not provided"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-muted-foreground">Barangay</p>
                <p className="font-medium">
                  {formValues.barangay || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Municipality</p>
                <p className="font-medium">
                  {formValues.municipality || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Province</p>
                <p className="font-medium">
                  {formValues.province || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Education</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Education Level</p>
              <p className="font-medium">
                {formValues.educationLevel || "Not provided"}
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
              <p className="text-muted-foreground">Years</p>
              <p className="font-medium">
                {formValues.startYear && formValues.endYear
                  ? `${formValues.startYear} - ${formValues.endYear}`
                  : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">
                {formValues.isGraduated
                  ? "Graduated"
                  : formValues.isCurrentlyEnrolled
                    ? "Currently Enrolled"
                    : "Not specified"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Contact Number</p>
              <p className="font-medium">
                {formValues.contact || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Facebook</p>
              <p className="font-medium truncate">
                {formValues.facebook || "Not provided"}
              </p>
            </div>
          </div>
          {formValues.languageDialect && (
            <div className="mt-4">
              <p className="text-muted-foreground text-sm">
                Languages / Dialects
              </p>
              <p className="font-medium text-sm">
                {formValues.languageDialect}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
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
    </div>
  );
};

export default ReviewSection;
