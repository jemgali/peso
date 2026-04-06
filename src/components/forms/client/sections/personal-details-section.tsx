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

const PersonalDetailsSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
}) => {
  return (
    <div
      id="personal-details"
      ref={setSectionRef("personal-details")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Personal Details</h2>
        <p className="text-sm text-muted-foreground">
          Tell us more about yourself
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.birthdate}>
              <FieldLabel htmlFor="birthdate">Date of Birth</FieldLabel>
              <Input
                {...register("birthdate")}
                type="date"
                id="birthdate"
                disabled={isPending}
                aria-invalid={!!errors.birthdate}
              />
              {errors.birthdate && (
                <FieldError>{errors.birthdate.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.age}>
              <FieldLabel htmlFor="age">Age</FieldLabel>
              <Input
                {...register("age")}
                type="number"
                id="age"
                disabled={isPending}
                placeholder="25"
                aria-invalid={!!errors.age}
              />
              {errors.age && <FieldError>{errors.age.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.placeOfBirth}>
              <FieldLabel htmlFor="placeOfBirth">Place of Birth</FieldLabel>
              <Input
                {...register("placeOfBirth")}
                type="text"
                id="placeOfBirth"
                disabled={isPending}
                placeholder="City, Province"
                aria-invalid={!!errors.placeOfBirth}
              />
              {errors.placeOfBirth && (
                <FieldError>{errors.placeOfBirth.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.sex}>
              <FieldLabel htmlFor="sex">Sex</FieldLabel>
              <select
                {...register("sex")}
                id="sex"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.sex}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.sex && <FieldError>{errors.sex.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.height}>
              <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
              <Input
                {...register("height")}
                type="number"
                id="height"
                disabled={isPending}
                placeholder="170"
                aria-invalid={!!errors.height}
              />
              {errors.height && (
                <FieldError>{errors.height.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.civilStatus}>
              <FieldLabel htmlFor="civilStatus">Civil Status</FieldLabel>
              <select
                {...register("civilStatus")}
                id="civilStatus"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.civilStatus}
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.civilStatus && (
                <FieldError>{errors.civilStatus.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default PersonalDetailsSection;
