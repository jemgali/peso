import React from "react";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionProps } from "./types";

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
            <Field data-invalid={!!errors.guardianName}>
              <FieldLabel htmlFor="guardianName">Guardian Name</FieldLabel>
              <Input
                {...register("guardianName")}
                type="text"
                id="guardianName"
                disabled={isPending}
                placeholder="Full name of guardian"
                aria-invalid={!!errors.guardianName}
              />
              {errors.guardianName && (
                <FieldError>{errors.guardianName.message}</FieldError>
              )}
            </Field>

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
                <option value="">Select relationship...</option>
                <option value="Parent">Parent</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Aunt/Uncle">Aunt/Uncle</option>
                <option value="Sibling">Sibling</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Relative">Other Relative</option>
                <option value="Other">Other</option>
              </select>
              {errors.guardianRelationship && (
                <FieldError>{errors.guardianRelationship.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.guardianAge}>
              <FieldLabel htmlFor="guardianAge">Age</FieldLabel>
              <Input
                {...register("guardianAge")}
                type="number"
                id="guardianAge"
                disabled={isPending}
                placeholder="Age"
                min={18}
                aria-invalid={!!errors.guardianAge}
              />
              {errors.guardianAge && (
                <FieldError>{errors.guardianAge.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.guardianOccupation}>
              <FieldLabel htmlFor="guardianOccupation">Occupation</FieldLabel>
              <Input
                {...register("guardianOccupation")}
                type="text"
                id="guardianOccupation"
                disabled={isPending}
                placeholder="e.g., Teacher, Business Owner"
                aria-invalid={!!errors.guardianOccupation}
              />
              {errors.guardianOccupation && (
                <FieldError>{errors.guardianOccupation.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.guardianContact}>
              <FieldLabel htmlFor="guardianContact">Contact Number</FieldLabel>
              <Input
                {...register("guardianContact")}
                type="tel"
                id="guardianContact"
                disabled={isPending}
                placeholder="+63 9XX-XXX-XXXX"
                aria-invalid={!!errors.guardianContact}
              />
              {errors.guardianContact && (
                <FieldError>{errors.guardianContact.message}</FieldError>
              )}
            </Field>
          </div>

          <Field data-invalid={!!errors.guardianAddress}>
            <FieldLabel htmlFor="guardianAddress">Address</FieldLabel>
            <Textarea
              {...register("guardianAddress")}
              id="guardianAddress"
              disabled={isPending}
              placeholder="Complete address of guardian"
              aria-invalid={!!errors.guardianAddress}
              className="min-h-20"
            />
            {errors.guardianAddress && (
              <FieldError>{errors.guardianAddress.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default GuardianSection;
