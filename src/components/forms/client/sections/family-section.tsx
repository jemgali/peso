import React from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import { Plus, X } from "lucide-react";
import type { FormSectionWithFieldArrayProps } from "./types";

const FamilySection: React.FC<FormSectionWithFieldArrayProps> = ({
  register,
  errors,
  isPending,
  siblingsFieldArray,
}) => {
  return (
    <div id="family" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Family Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your family members
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-6">
          {/* Father's Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Father&apos;s Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field data-invalid={!!errors.fatherName}>
                <FieldLabel htmlFor="fatherName">Full Name</FieldLabel>
                <Input
                  {...register("fatherName")}
                  type="text"
                  id="fatherName"
                  disabled={isPending}
                  placeholder="Father's full name"
                  aria-invalid={!!errors.fatherName}
                />
                {errors.fatherName && (
                  <FieldError>{errors.fatherName.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.fatherOccupation}>
                <FieldLabel htmlFor="fatherOccupation">Occupation</FieldLabel>
                <Input
                  {...register("fatherOccupation")}
                  type="text"
                  id="fatherOccupation"
                  disabled={isPending}
                  placeholder="Occupation"
                  aria-invalid={!!errors.fatherOccupation}
                />
                {errors.fatherOccupation && (
                  <FieldError>{errors.fatherOccupation.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.fatherContact}>
                <FieldLabel htmlFor="fatherContact">Contact Number</FieldLabel>
                <Input
                  {...register("fatherContact")}
                  type="tel"
                  id="fatherContact"
                  disabled={isPending}
                  placeholder="+63 9XX-XXX-XXXX"
                  aria-invalid={!!errors.fatherContact}
                />
                {errors.fatherContact && (
                  <FieldError>{errors.fatherContact.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {/* Mother's Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Mother&apos;s Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field data-invalid={!!errors.motherMaidenName}>
                <FieldLabel htmlFor="motherMaidenName">
                  Maiden Name
                </FieldLabel>
                <Input
                  {...register("motherMaidenName")}
                  type="text"
                  id="motherMaidenName"
                  disabled={isPending}
                  placeholder="Mother's maiden name"
                  aria-invalid={!!errors.motherMaidenName}
                />
                {errors.motherMaidenName && (
                  <FieldError>{errors.motherMaidenName.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.motherOccupation}>
                <FieldLabel htmlFor="motherOccupation">Occupation</FieldLabel>
                <Input
                  {...register("motherOccupation")}
                  type="text"
                  id="motherOccupation"
                  disabled={isPending}
                  placeholder="Occupation"
                  aria-invalid={!!errors.motherOccupation}
                />
                {errors.motherOccupation && (
                  <FieldError>{errors.motherOccupation.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.motherContact}>
                <FieldLabel htmlFor="motherContact">Contact Number</FieldLabel>
                <Input
                  {...register("motherContact")}
                  type="tel"
                  id="motherContact"
                  disabled={isPending}
                  placeholder="+63 9XX-XXX-XXXX"
                  aria-invalid={!!errors.motherContact}
                />
                {errors.motherContact && (
                  <FieldError>{errors.motherContact.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {/* Siblings Information */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Siblings
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add information about your siblings
                </p>
              </div>
              <Field data-invalid={!!errors.numberOfSiblings} className="w-32">
                <FieldLabel htmlFor="numberOfSiblings">Total</FieldLabel>
                <Input
                  {...register("numberOfSiblings")}
                  type="number"
                  id="numberOfSiblings"
                  disabled={isPending}
                  placeholder="0"
                  min={0}
                  aria-invalid={!!errors.numberOfSiblings}
                />
              </Field>
            </div>

            <div className="space-y-3">
              {siblingsFieldArray?.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                    <Input
                      {...register(`siblings.${index}.name` as const)}
                      type="text"
                      disabled={isPending}
                      placeholder="Name"
                    />
                    <Input
                      {...register(`siblings.${index}.age` as const)}
                      type="number"
                      disabled={isPending}
                      placeholder="Age"
                      min={0}
                    />
                    <select
                      {...register(`siblings.${index}.sex` as const)}
                      disabled={isPending}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Sex...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => siblingsFieldArray.remove(index)}
                    disabled={isPending}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  siblingsFieldArray?.append({ name: "", age: undefined, sex: "" })
                }
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sibling
              </Button>
            </div>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default FamilySection;
