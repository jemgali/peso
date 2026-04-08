import React from "react";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextField } from "@/components/shared";
import type { FormSectionProps } from "./types";

const BENEFACTOR_RELATIONSHIP_OPTIONS = [
  { value: "", label: "Select relationship..." },
  { value: "Parent", label: "Parent" },
  { value: "Grandparent", label: "Grandparent" },
  { value: "Aunt/Uncle", label: "Aunt/Uncle" },
  { value: "Sibling", label: "Sibling" },
  { value: "Relative", label: "Other Relative" },
  { value: "Employer", label: "Employer" },
  { value: "Sponsor", label: "Sponsor" },
  { value: "NGO", label: "NGO/Organization" },
  { value: "Government", label: "Government Agency" },
  { value: "Other", label: "Other" },
];

const BenefactorSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
}) => {
  return (
    <div id="benefactor" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Benefactor Information</h2>
        <p className="text-sm text-muted-foreground">
          If someone else is supporting your application, provide their details
          here
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              name="benefactorName"
              label="Benefactor Name"
              register={register}
              error={errors.benefactorName?.message}
              disabled={isPending}
              placeholder="Full name of benefactor"
            />

            <Field data-invalid={!!errors.benefactorRelationship}>
              <FieldLabel htmlFor="benefactorRelationship">
                Relationship to You
              </FieldLabel>
              <select
                {...register("benefactorRelationship")}
                id="benefactorRelationship"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.benefactorRelationship}
              >
                {BENEFACTOR_RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.benefactorRelationship && (
                <FieldError>
                  {errors.benefactorRelationship.message}
                </FieldError>
              )}
            </Field>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: This section is optional. Only fill this if you have a
            benefactor who is supporting your SPES application.
          </p>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default BenefactorSection;
