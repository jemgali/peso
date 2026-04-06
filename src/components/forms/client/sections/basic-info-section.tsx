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

const BasicInfoSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
}) => {
  return (
    <div
      id="basic-info"
      ref={setSectionRef("basic-info")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide your basic personal information
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.profileLastName}>
              <FieldLabel htmlFor="profileLastName">Last Name *</FieldLabel>
              <Input
                {...register("profileLastName")}
                type="text"
                id="profileLastName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Dela Cruz"
                aria-invalid={!!errors.profileLastName}
              />
              {errors.profileLastName && (
                <FieldError>{errors.profileLastName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileFirstName}>
              <FieldLabel htmlFor="profileFirstName">First Name *</FieldLabel>
              <Input
                {...register("profileFirstName")}
                type="text"
                id="profileFirstName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Juan"
                aria-invalid={!!errors.profileFirstName}
              />
              {errors.profileFirstName && (
                <FieldError>{errors.profileFirstName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileMiddleName}>
              <FieldLabel htmlFor="profileMiddleName">Middle Name</FieldLabel>
              <Input
                {...register("profileMiddleName")}
                type="text"
                id="profileMiddleName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Antonio"
                aria-invalid={!!errors.profileMiddleName}
              />
              {errors.profileMiddleName && (
                <FieldError>{errors.profileMiddleName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileSuffix}>
              <FieldLabel htmlFor="profileSuffix">Suffix</FieldLabel>
              <Input
                {...register("profileSuffix")}
                type="text"
                id="profileSuffix"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Jr, Sr"
                aria-invalid={!!errors.profileSuffix}
              />
              {errors.profileSuffix && (
                <FieldError>{errors.profileSuffix.message}</FieldError>
              )}
            </Field>
          </div>

          <Field data-invalid={!!errors.profileRole}>
            <FieldLabel htmlFor="profileRole">Role / Designation *</FieldLabel>
            <Input
              {...register("profileRole")}
              type="text"
              id="profileRole"
              disabled={isPending}
              placeholder="e.g., Applicant, Job Seeker"
              aria-invalid={!!errors.profileRole}
            />
            {errors.profileRole && (
              <FieldError>{errors.profileRole.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default BasicInfoSection;
