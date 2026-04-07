import React from "react";
import { Input } from "@/ui/input";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionProps } from "./types";

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
                <optgroup label="Elementary">
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </optgroup>
                <optgroup label="Junior High School">
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </optgroup>
                <optgroup label="Senior High School">
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </optgroup>
                <optgroup label="College/University">
                  <option value="1st Year College">1st Year College</option>
                  <option value="2nd Year College">2nd Year College</option>
                  <option value="3rd Year College">3rd Year College</option>
                  <option value="4th Year College">4th Year College</option>
                  <option value="5th Year College">5th Year College</option>
                </optgroup>
                <optgroup label="Vocational">
                  <option value="Vocational/TESDA">Vocational/TESDA</option>
                </optgroup>
                <optgroup label="Graduate Studies">
                  <option value="Masters">Masters</option>
                  <option value="Doctorate">Doctorate</option>
                </optgroup>
              </select>
              {errors.gradeYear && (
                <FieldError>{errors.gradeYear.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.schoolName}>
              <FieldLabel htmlFor="schoolName">School Name</FieldLabel>
              <Input
                {...register("schoolName")}
                type="text"
                id="schoolName"
                disabled={isPending}
                placeholder="Name of school/university"
                aria-invalid={!!errors.schoolName}
              />
              {errors.schoolName && (
                <FieldError>{errors.schoolName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.trackCourse}>
              <FieldLabel htmlFor="trackCourse">
                Track/Strand/Course
              </FieldLabel>
              <Input
                {...register("trackCourse")}
                type="text"
                id="trackCourse"
                disabled={isPending}
                placeholder="e.g., STEM, ABM, BS Computer Science"
                aria-invalid={!!errors.trackCourse}
              />
              {errors.trackCourse && (
                <FieldError>{errors.trackCourse.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.schoolYear}>
              <FieldLabel htmlFor="schoolYear">School Year</FieldLabel>
              <Input
                {...register("schoolYear")}
                type="text"
                id="schoolYear"
                disabled={isPending}
                placeholder="e.g., 2023-2024"
                aria-invalid={!!errors.schoolYear}
              />
              {errors.schoolYear && (
                <FieldError>{errors.schoolYear.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default EducationSection;
