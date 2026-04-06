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
            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
              <Input
                {...register("lastName")}
                type="text"
                id="lastName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Dela Cruz"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <FieldError>{errors.lastName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
              <Input
                {...register("firstName")}
                type="text"
                id="firstName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Juan"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <FieldError>{errors.firstName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.middleName}>
              <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
              <Input
                {...register("middleName")}
                type="text"
                id="middleName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Antonio"
                aria-invalid={!!errors.middleName}
              />
              {errors.middleName && (
                <FieldError>{errors.middleName.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.suffix}>
              <FieldLabel htmlFor="suffix">Suffix</FieldLabel>
              <Input
                {...register("suffix")}
                type="text"
                id="suffix"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="Jr, Sr"
                aria-invalid={!!errors.suffix}
              />
              {errors.suffix && (
                <FieldError>{errors.suffix.message}</FieldError>
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
