import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/ui/textarea";
import { Checkbox } from "@/ui/checkbox";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionWithControlProps } from "./types";

const SPESInfoSection: React.FC<FormSectionWithControlProps> = ({
  register,
  errors,
  isPending,
  control,
  setSectionRef,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      id="spes-info"
      ref={setSectionRef("spes-info")}
      className="scroll-mt-24"
    >
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
              <FieldLabel htmlFor="applicationYear">
                Application Year
              </FieldLabel>
              <select
                {...register("applicationYear")}
                id="applicationYear"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.applicationYear}
              >
                <option value="">Select year...</option>
                {[currentYear, currentYear + 1].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.applicationYear && (
                <FieldError>{errors.applicationYear.message}</FieldError>
              )}
            </Field>
          </div>

          <Field data-invalid={!!errors.motivation}>
            <FieldLabel htmlFor="motivation">
              Why do you want to apply for SPES?
            </FieldLabel>
            <Textarea
              {...register("motivation")}
              id="motivation"
              disabled={isPending}
              placeholder="Share your reasons for applying to the SPES program. What do you hope to gain from this experience? How will it help you achieve your goals?"
              aria-invalid={!!errors.motivation}
              className="min-h-32"
            />
            {errors.motivation && (
              <FieldError>{errors.motivation.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.remarks}>
            <FieldLabel htmlFor="remarks">
              Additional Remarks (Optional)
            </FieldLabel>
            <Textarea
              {...register("remarks")}
              id="remarks"
              disabled={isPending}
              placeholder="Any additional information you would like us to know about your application"
              aria-invalid={!!errors.remarks}
              className="min-h-24"
            />
            {errors.remarks && (
              <FieldError>{errors.remarks.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default SPESInfoSection;
