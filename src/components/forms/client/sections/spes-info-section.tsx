import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from "@/ui/field";
import { TextareaField } from "@/components/shared";
import { Plus, X } from "lucide-react";
import type { FormSectionWithFieldArrayProps } from "./types";

const SPESInfoSection: React.FC<FormSectionWithFieldArrayProps> = ({
  register,
  errors,
  isPending,
  control,
  applicationType,
  spesAvailmentsFieldArray,
}) => {
  const currentYear = new Date().getFullYear();

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
          </div>

          {applicationType === "spes-baby" && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">Years of Availment</h3>
                  <p className="text-xs text-muted-foreground">
                    Add previous SPES availments. Year of availment and assigned office are required.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    spesAvailmentsFieldArray?.append({
                      yearOfAvailment: currentYear,
                      assignedOffice: "",
                    })
                  }
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Year
                </Button>
              </div>

              {errors.spesAvailments?.message && (
                <FieldError>{errors.spesAvailments.message}</FieldError>
              )}

              <div className="space-y-3">
                {spesAvailmentsFieldArray?.fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg bg-muted/30 p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr_auto]">
                      <Field data-invalid={!!errors.spesAvailments?.[index]?.yearOfAvailment}>
                        <FieldLabel htmlFor={`spesAvailments.${index}.yearOfAvailment`} required>
                          Availment Year
                        </FieldLabel>
                        <Input
                          {...register(`spesAvailments.${index}.yearOfAvailment`, {
                            valueAsNumber: true,
                            setValueAs: (value) =>
                              value === "" || value === undefined
                                ? undefined
                                : Number(value),
                          })}
                          id={`spesAvailments.${index}.yearOfAvailment`}
                          type="number"
                          min={1900}
                          max={currentYear}
                          disabled={isPending}
                          required
                          aria-invalid={!!errors.spesAvailments?.[index]?.yearOfAvailment}
                        />
                        {errors.spesAvailments?.[index]?.yearOfAvailment && (
                          <FieldError>{errors.spesAvailments[index].yearOfAvailment?.message}</FieldError>
                        )}
                      </Field>

                      <Field data-invalid={!!errors.spesAvailments?.[index]?.assignedOffice}>
                        <FieldLabel htmlFor={`spesAvailments.${index}.assignedOffice`} required>
                          Assigned Office
                        </FieldLabel>
                        <Input
                          {...register(`spesAvailments.${index}.assignedOffice`)}
                          id={`spesAvailments.${index}.assignedOffice`}
                          type="text"
                          placeholder="e.g. PESO Main Office"
                          disabled={isPending}
                          required
                          aria-invalid={!!errors.spesAvailments?.[index]?.assignedOffice}
                        />
                        {errors.spesAvailments?.[index]?.assignedOffice && (
                          <FieldError>{errors.spesAvailments[index].assignedOffice?.message}</FieldError>
                        )}
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => spesAvailmentsFieldArray.remove(index)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
