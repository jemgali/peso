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

const BenefactorSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
}) => {
  return (
    <div
      id="benefactor"
      ref={setSectionRef("benefactor")}
      className="scroll-mt-24"
    >
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
            <Field data-invalid={!!errors.benefactorName}>
              <FieldLabel htmlFor="benefactorName">
                Benefactor Name
              </FieldLabel>
              <Input
                {...register("benefactorName")}
                type="text"
                id="benefactorName"
                disabled={isPending}
                placeholder="Full name of benefactor"
                aria-invalid={!!errors.benefactorName}
              />
              {errors.benefactorName && (
                <FieldError>{errors.benefactorName.message}</FieldError>
              )}
            </Field>

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
                <option value="">Select relationship...</option>
                <option value="Parent">Parent</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Aunt/Uncle">Aunt/Uncle</option>
                <option value="Sibling">Sibling</option>
                <option value="Relative">Other Relative</option>
                <option value="Employer">Employer</option>
                <option value="Sponsor">Sponsor</option>
                <option value="NGO">NGO/Organization</option>
                <option value="Government">Government Agency</option>
                <option value="Other">Other</option>
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
