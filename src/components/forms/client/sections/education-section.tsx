import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/ui/input";
import { Checkbox } from "@/ui/checkbox";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionWithControlProps } from "./types";

const EducationSection: React.FC<FormSectionWithControlProps> = ({
  register,
  errors,
  isPending,
  control,
  setSectionRef,
}) => {
  return (
    <div
      id="education"
      ref={setSectionRef("education")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Educational Background</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your education
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.educationLevel}>
              <FieldLabel htmlFor="educationLevel">Education Level</FieldLabel>
              <select
                {...register("educationLevel")}
                id="educationLevel"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.educationLevel}
              >
                <option value="">Select...</option>
                <option value="Elementary">Elementary</option>
                <option value="High School">High School</option>
                <option value="Senior High School">Senior High School</option>
                <option value="Vocational">Vocational/Technical</option>
                <option value="College">College/University</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
              {errors.educationLevel && (
                <FieldError>{errors.educationLevel.message}</FieldError>
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

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.startYear}>
                <FieldLabel htmlFor="startYear">Start Year</FieldLabel>
                <Input
                  {...register("startYear")}
                  type="number"
                  id="startYear"
                  disabled={isPending}
                  placeholder="2020"
                  aria-invalid={!!errors.startYear}
                />
                {errors.startYear && (
                  <FieldError>{errors.startYear.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.endYear}>
                <FieldLabel htmlFor="endYear">End Year</FieldLabel>
                <Input
                  {...register("endYear")}
                  type="number"
                  id="endYear"
                  disabled={isPending}
                  placeholder="2024"
                  aria-invalid={!!errors.endYear}
                />
                {errors.endYear && (
                  <FieldError>{errors.endYear.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Controller
                name="isGraduated"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isGraduated"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <label
                htmlFor="isGraduated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Graduated
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="isCurrentlyEnrolled"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isCurrentlyEnrolled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <label
                htmlFor="isCurrentlyEnrolled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Currently Enrolled
              </label>
            </div>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default EducationSection;
