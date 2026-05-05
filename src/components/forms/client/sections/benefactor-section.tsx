import React from "react";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextField } from "@/components/shared";
import type { FormSectionProps } from "./types";

const BENEFACTOR_RELATIONSHIP_OPTIONS = [
  { value: "", label: "Select relationship..." },
  { value: "MOTHER", label: "MOTHER" },
  { value: "FATHER", label: "FATHER" },
  { value: "SISTER", label: "SISTER" },
  { value: "BROTHER", label: "BROTHER" },
  { value: "GRANDPARENT", label: "GRANDPARENT" },
  { value: "AUNT/UNCLE", label: "AUNT/UNCLE" },
  { value: "RELATIVE", label: "OTHER RELATIVE" },
  { value: "EMPLOYER", label: "EMPLOYER" },
  { value: "SPONSOR", label: "SPONSOR" },
  { value: "NGO", label: "NGO/ORGANIZATION" },
  { value: "GOVERNMENT", label: "GOVERNMENT AGENCY" },
  { value: "OTHER", label: "OTHER" },
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
          Provide your benefactor details. Both fields are required.
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
                required
                className="uppercase"
              />

              <Field data-invalid={!!errors.benefactorRelationship}>
                <FieldLabel htmlFor="benefactorRelationship" required>
                  Relationship to You
                </FieldLabel>
                <select
                  {...register("benefactorRelationship")}
                  id="benefactorRelationship"
                  disabled={isPending}
                  required
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

          <p className="text-xs text-muted-foreground">This section is required for SPES submission.</p>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default BenefactorSection;
