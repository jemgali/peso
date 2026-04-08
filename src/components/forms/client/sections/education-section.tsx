import React from "react";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextField } from "@/components/shared";
import type { FormSectionProps } from "./types";

const GRADE_YEAR_OPTIONS = [
  { group: "Elementary", options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"] },
  { group: "Junior High School", options: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
  { group: "Senior High School", options: ["Grade 11", "Grade 12"] },
  { group: "College/University", options: ["1st Year College", "2nd Year College", "3rd Year College", "4th Year College", "5th Year College"] },
  { group: "Vocational", options: ["Vocational/TESDA"] },
  { group: "Graduate Studies", options: ["Masters", "Doctorate"] },
];

const EducationSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
}) => {
  return (
    <div id="education" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Educational Background</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your education
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.gradeYear}>
              <FieldLabel htmlFor="gradeYear">
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
                      <option key={opt} value={opt}>{opt}</option>
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
            />

            <TextField
              name="trackCourse"
              label="Track/Strand/Course"
              register={register}
              error={errors.trackCourse?.message}
              disabled={isPending}
              placeholder="e.g., STEM, ABM, BS Computer Science"
            />

            <TextField
              name="schoolYear"
              label="School Year"
              register={register}
              error={errors.schoolYear?.message}
              disabled={isPending}
              placeholder="e.g., 2023-2024"
            />
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default EducationSection;
