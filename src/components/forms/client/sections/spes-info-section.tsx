import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextareaField } from "@/components/shared";
import type { FormSectionWithControlProps } from "./types";

const SPESInfoSection: React.FC<FormSectionWithControlProps> = ({
  register,
  errors,
  isPending,
  control,
  applicationType,
}) => {
  const currentYear = new Date().getFullYear();
  const applicationYearOptions = [currentYear, currentYear + 1];

  return (
    <div id="spes-info" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">SPES Application Details</h2>
        <p className="text-sm text-muted-foreground">
          Provide information specific to your SPES (Special Program for
          Employment of Students) application
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-6">
          {/* 4Ps Beneficiary */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <Controller
              name="isFourPsBeneficiary"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isFourPsBeneficiary"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="mt-0.5"
                />
              )}
            />
            <div>
              <label
                htmlFor="isFourPsBeneficiary"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                4Ps (Pantawid Pamilyang Pilipino Program) Beneficiary
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Check this box if you or your family is a beneficiary of the
                4Ps/CCT program
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.applicationYear}>
              <FieldLabel htmlFor="applicationYear">Application Year</FieldLabel>
              <input type="hidden" {...register("applicationYear", { valueAsNumber: true })} value={currentYear} />
              <Input
                id="applicationYear"
                type="number"
                disabled
                readOnly
                value={currentYear}
                className="bg-muted"
                aria-invalid={!!errors.applicationYear}
              />
              {errors.applicationYear && (
                <FieldError>{errors.applicationYear.message}</FieldError>
              )}
            </Field>

            {applicationType === "spes-baby" && (
              <Field data-invalid={!!errors.spesBabiesAvailmentYears}>
                <FieldLabel htmlFor="spesBabiesAvailmentYears" required>
                  Years of Availment
                </FieldLabel>
                <Input
                  {...register("spesBabiesAvailmentYears", { valueAsNumber: true })}
                  type="number"
                  id="spesBabiesAvailmentYears"
                  disabled={isPending}
                  placeholder="e.g. 1"
                  min={1}
                  aria-invalid={!!errors.spesBabiesAvailmentYears}
                />
                {errors.spesBabiesAvailmentYears && (
                  <FieldError>{errors.spesBabiesAvailmentYears.message}</FieldError>
                )}
              </Field>
            )}
          </div>

          <TextareaField
            name="motivation"
            label="Why do you want to apply for SPES?"
            register={register}
            error={errors.motivation?.message}
            disabled={isPending}
            placeholder="Share your reasons for applying to the SPES program. What do you hope to gain from this experience? How will it help you achieve your goals?"
            className="min-h-32"
            required
          />
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default SPESInfoSection;
