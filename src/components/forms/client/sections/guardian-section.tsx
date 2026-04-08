import React from "react";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextField, TextareaField } from "@/components/shared";
import type { FormSectionProps } from "./types";

const GUARDIAN_RELATIONSHIP_OPTIONS = [
  { value: "", label: "Select relationship..." },
  { value: "Parent", label: "Parent" },
  { value: "Grandparent", label: "Grandparent" },
  { value: "Aunt/Uncle", label: "Aunt/Uncle" },
  { value: "Sibling", label: "Sibling" },
  { value: "Legal Guardian", label: "Legal Guardian" },
  { value: "Relative", label: "Other Relative" },
  { value: "Other", label: "Other" },
];

const GuardianSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
}) => {
  return (
    <div id="guardian" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Guardian Information</h2>
        <p className="text-sm text-muted-foreground">
          Provide details about your legal guardian (if applicable)
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              name="guardianName"
              label="Guardian Name"
              register={register}
              error={errors.guardianName?.message}
              disabled={isPending}
              placeholder="Full name of guardian"
            />

            <Field data-invalid={!!errors.guardianRelationship}>
              <FieldLabel htmlFor="guardianRelationship">
                Relationship to You
              </FieldLabel>
              <select
                {...register("guardianRelationship")}
                id="guardianRelationship"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.guardianRelationship}
              >
                {GUARDIAN_RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.guardianRelationship && (
                <FieldError>{errors.guardianRelationship.message}</FieldError>
              )}
            </Field>

            <TextField
              name="guardianAge"
              label="Age"
              register={register}
              error={errors.guardianAge?.message}
              disabled={isPending}
              type="number"
              placeholder="Age"
            />

            <TextField
              name="guardianOccupation"
              label="Occupation"
              register={register}
              error={errors.guardianOccupation?.message}
              disabled={isPending}
              placeholder="e.g., Teacher, Business Owner"
            />

            <TextField
              name="guardianContact"
              label="Contact Number"
              register={register}
              error={errors.guardianContact?.message}
              disabled={isPending}
              type="tel"
              placeholder="+63 9XX-XXX-XXXX"
            />
          </div>

          <TextareaField
            name="guardianAddress"
            label="Address"
            register={register}
            error={errors.guardianAddress?.message}
            disabled={isPending}
            placeholder="Complete address of guardian"
            className="min-h-20"
          />
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default GuardianSection;
