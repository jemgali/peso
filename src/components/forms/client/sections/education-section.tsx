"use client";

import React from "react";
import {
  FieldSet,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import { Input } from "@/ui/input";
import { TextField } from "@/components/shared";
import { useAutoCapitalize } from "@/hooks/use-auto-capitalize";
import type { FormSectionProps } from "./types";

const GRADE_YEAR_OPTIONS = [
  {
    group: "ELEMENTARY",
    options: ["GRADE 1", "GRADE 2", "GRADE 3", "GRADE 4", "GRADE 5", "GRADE 6"],
  },
  {
    group: "JUNIOR HIGH SCHOOL",
    options: ["GRADE 7", "GRADE 8", "GRADE 9", "GRADE 10"],
  },
  { group: "SENIOR HIGH SCHOOL", options: ["GRADE 11", "GRADE 12"] },
  {
    group: "COLLEGE/UNIVERSITY",
    options: [
      "1ST YEAR COLLEGE",
      "2ND YEAR COLLEGE",
      "3RD YEAR COLLEGE",
      "4TH YEAR COLLEGE",
      "5TH YEAR COLLEGE",
    ],
  },
  { group: "VOCATIONAL", options: ["VOCATIONAL/TESDA"] },
  { group: "GRADUATE STUDIES", options: ["MASTERS", "DOCTORATE"] },
];

const LOWER_GRADES = new Set([
  "GRADE 1",
  "GRADE 2",
  "GRADE 3",
  "GRADE 4",
  "GRADE 5",
  "GRADE 6",
  "GRADE 7",
  "GRADE 8",
  "GRADE 9",
  "GRADE 10",
]);
const SENIOR_HIGH_GRADES = new Set(["GRADE 11", "GRADE 12"]);
const SENIOR_HIGH_STRANDS = [
  "STEM",
  "ABM",
  "HUMSS",
  "GAS",
  "TVL",
  "SPORTS",
  "ARTS AND DESIGN",
  "OTHERS",
];

const EducationSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setValue,
  watch,
}) => {
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);
  const selectedGradeYear = watch?.("gradeYear") || "";
  const currentSchoolYear = watch?.("schoolYear") || "";
  const currentTrackValue = watch?.("trackCourse") || "";
  const useStrandDropdown = SENIOR_HIGH_GRADES.has(selectedGradeYear);
  const isLowerGrade = LOWER_GRADES.has(selectedGradeYear);

  // Track if "OTHERS" is selected in the dropdown
  const [isOtherTrack, setIsOtherTrack] = React.useState(false);
  const [customTrack, setCustomTrack] = React.useState("");

  // Sync isOtherTrack state with form value on mount or change
  React.useEffect(() => {
    if (useStrandDropdown && currentTrackValue) {
      const isKnown = SENIOR_HIGH_STRANDS.some(
        (s) => s === currentTrackValue && s !== "OTHERS"
      );
      if (!isKnown && currentTrackValue !== "") {
        setIsOtherTrack(true);
        setCustomTrack(currentTrackValue);
      } else if (currentTrackValue === "OTHERS") {
        setIsOtherTrack(true);
      } else {
        setIsOtherTrack(false);
      }
    }
  }, [useStrandDropdown, currentTrackValue]);

  // Auto-set track/course to N/A for lower grades
  React.useEffect(() => {
    if (isLowerGrade && setValue) {
      setValue("trackCourse", "N/A", { shouldValidate: true });
    }
  }, [isLowerGrade, setValue]);

  // Auto-calculate school year: (currentYear-1)-(currentYear)
  React.useEffect(() => {
    if (!currentSchoolYear && setValue) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const prevYear = currentYear - 1;
      setValue("schoolYear", `${prevYear}-${currentYear}`, {
        shouldValidate: true,
      });
    }
  }, [currentSchoolYear, setValue]);

  return (
    <div id="education" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Educational Background</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your current education. All fields are required.
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.gradeYear}>
              <FieldLabel htmlFor="gradeYear" required>
                Grade/Year Level
              </FieldLabel>
              <select
                {...register("gradeYear")}
                id="gradeYear"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.gradeYear}
              >
                <option value="">Select...</option>
                {GRADE_YEAR_OPTIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.gradeYear && (
                <FieldError>{errors.gradeYear.message}</FieldError>
              )}
            </Field>

            <TextField
              name="schoolName"
              label="School Name"
              register={register}
              error={errors.schoolName?.message}
              disabled={isPending}
              placeholder="Name of school/university"
              required
              onBlur={autoCapitalizeBlur("schoolName")}
              className="uppercase"
            />

            {useStrandDropdown ? (
              <div className="space-y-3">
                <Field data-invalid={!!errors.trackCourse}>
                  <FieldLabel htmlFor="trackCourse" required>
                    Track / Strand
                  </FieldLabel>
                  <select
                    value={isOtherTrack ? "OTHERS" : currentTrackValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "OTHERS") {
                        setIsOtherTrack(true);
                        setCustomTrack("");
                        setValue?.("trackCourse", "", { shouldValidate: true });
                      } else {
                        setIsOtherTrack(false);
                        setCustomTrack("");
                        setValue?.("trackCourse", val, { shouldValidate: true });
                      }
                    }}
                    id="trackCourse"
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 uppercase"
                  >
                    <option value="">SELECT STRAND...</option>
                    {SENIOR_HIGH_STRANDS.map((strand) => (
                      <option key={strand} value={strand}>
                        {strand}
                      </option>
                    ))}
                  </select>
                  {errors.trackCourse && (
                    <FieldError>{errors.trackCourse.message}</FieldError>
                  )}
                </Field>

                {isOtherTrack && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <Field data-invalid={!!errors.trackCourse}>
                      <FieldLabel htmlFor="customTrackCourse" required>
                        Specify Track / Strand
                      </FieldLabel>
                      <Input
                        id="customTrackCourse"
                        placeholder="ENTER TRACK OR STRAND"
                        disabled={isPending}
                        value={customTrack}
                        onChange={(e) => {
                          setCustomTrack(e.target.value);
                          setValue?.("trackCourse", e.target.value, {
                            shouldValidate: true,
                          });
                        }}
                        onBlur={() => {
                          const val = customTrack.trim().toUpperCase();
                          setCustomTrack(val);
                          setValue?.("trackCourse", val, { shouldValidate: true });
                        }}
                        className="uppercase"
                      />
                    </Field>
                  </div>
                )}
              </div>
            ) : (
              <TextField
                name="trackCourse"
                label={
                  isLowerGrade
                    ? "Track / Course"
                    : selectedGradeYear.includes("College") ||
                        selectedGradeYear === "Vocational/TESDA" ||
                        selectedGradeYear === "Masters" ||
                        selectedGradeYear === "Doctorate"
                      ? "Course"
                      : "Track"
                }
                register={register}
                error={errors.trackCourse?.message}
                disabled={isPending || isLowerGrade}
                placeholder={
                  isLowerGrade
                    ? "N/A"
                    : "e.g., BS Computer Science, Automotive NC II"
                }
                required
                onBlur={autoCapitalizeBlur("trackCourse")}
                className="uppercase"
              />
            )}

            <TextField
              name="schoolYear"
              label="School Year"
              register={register}
              error={errors.schoolYear?.message}
              disabled={isPending}
              placeholder="e.g., 2023-2024"
              required
              className="uppercase"
            />
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default EducationSection;
