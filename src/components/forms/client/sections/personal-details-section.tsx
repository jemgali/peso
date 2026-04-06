import React from "react";
import { Input } from "@/ui/input";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionWithFieldArrayProps } from "./types";
import { Button } from "@/ui/button";
import { Plus, X } from "lucide-react";

const PersonalDetailsSection: React.FC<FormSectionWithFieldArrayProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
  languageFieldArray,
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
            <Field data-invalid={!!errors.profileBirthdate}>
              <FieldLabel htmlFor="profileBirthdate">Date of Birth</FieldLabel>
              <Input
                {...register("profileBirthdate")}
                type="date"
                id="profileBirthdate"
                disabled={isPending}
                aria-invalid={!!errors.profileBirthdate}
              />
              {errors.profileBirthdate && (
                <FieldError>{errors.profileBirthdate.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileAge}>
              <FieldLabel htmlFor="profileAge">Age</FieldLabel>
              <Input
                {...register("profileAge")}
                type="number"
                id="profileAge"
                disabled={isPending}
                placeholder="25"
                aria-invalid={!!errors.profileAge}
              />
              {errors.profileAge && (
                <FieldError>{errors.profileAge.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profilePlaceOfBirth}>
              <FieldLabel htmlFor="profilePlaceOfBirth">
                Place of Birth
              </FieldLabel>
              <Input
                {...register("profilePlaceOfBirth")}
                type="text"
                id="profilePlaceOfBirth"
                disabled={isPending}
                placeholder="City, Province"
                aria-invalid={!!errors.profilePlaceOfBirth}
              />
              {errors.profilePlaceOfBirth && (
                <FieldError>{errors.profilePlaceOfBirth.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileSex}>
              <FieldLabel htmlFor="profileSex">Sex</FieldLabel>
              <select
                {...register("profileSex")}
                id="profileSex"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.profileSex}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.profileSex && (
                <FieldError>{errors.profileSex.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileHeight}>
              <FieldLabel htmlFor="profileHeight">Height (cm)</FieldLabel>
              <Input
                {...register("profileHeight")}
                type="number"
                id="profileHeight"
                disabled={isPending}
                placeholder="170"
                aria-invalid={!!errors.profileHeight}
              />
              {errors.profileHeight && (
                <FieldError>{errors.profileHeight.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileCivilStatus}>
              <FieldLabel htmlFor="profileCivilStatus">Civil Status</FieldLabel>
              <select
                {...register("profileCivilStatus")}
                id="profileCivilStatus"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.profileCivilStatus}
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.profileCivilStatus && (
                <FieldError>{errors.profileCivilStatus.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileReligion}>
              <FieldLabel htmlFor="profileReligion">Religion</FieldLabel>
              <Input
                {...register("profileReligion")}
                type="text"
                id="profileReligion"
                disabled={isPending}
                placeholder="e.g., Catholic, Christian, Muslim"
                aria-invalid={!!errors.profileReligion}
              />
              {errors.profileReligion && (
                <FieldError>{errors.profileReligion.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileEmail}>
              <FieldLabel htmlFor="profileEmail">Email Address</FieldLabel>
              <Input
                {...register("profileEmail")}
                type="email"
                id="profileEmail"
                disabled={isPending}
                placeholder="email@example.com"
                aria-invalid={!!errors.profileEmail}
              />
              {errors.profileEmail && (
                <FieldError>{errors.profileEmail.message}</FieldError>
              )}
            </Field>
          </div>

          {/* Language/Dialect - Dynamic Array */}
          <div className="space-y-2">
            <FieldLabel>Languages / Dialects</FieldLabel>
            <div className="space-y-2">
              {languageFieldArray?.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`profileLanguageDialect.${index}.value` as const)}
                    type="text"
                    disabled={isPending}
                    placeholder="e.g., English, Tagalog, Cebuano"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => languageFieldArray.remove(index)}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => languageFieldArray?.append({ value: "" })}
                disabled={isPending}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>
          </div>

          {/* Disability Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <Field data-invalid={!!errors.profileDisability}>
              <FieldLabel htmlFor="profileDisability">
                Disability (if applicable)
              </FieldLabel>
              <Input
                {...register("profileDisability")}
                type="text"
                id="profileDisability"
                disabled={isPending}
                placeholder="Type of disability"
                aria-invalid={!!errors.profileDisability}
              />
              {errors.profileDisability && (
                <FieldError>{errors.profileDisability.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profilePwdId}>
              <FieldLabel htmlFor="profilePwdId">PWD ID Number</FieldLabel>
              <Input
                {...register("profilePwdId")}
                type="text"
                id="profilePwdId"
                disabled={isPending}
                placeholder="PWD ID (if applicable)"
                aria-invalid={!!errors.profilePwdId}
              />
              {errors.profilePwdId && (
                <FieldError>{errors.profilePwdId.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default PersonalDetailsSection;
