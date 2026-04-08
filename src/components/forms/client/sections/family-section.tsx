import React from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/ui/field";
import { Plus, X } from "lucide-react";
import { TextField } from "@/components/shared";
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
              <TextField
                name="fatherName"
                label="Full Name"
                register={register}
                error={errors.fatherName?.message}
                disabled={isPending}
                placeholder="Father's full name"
              />

              <TextField
                name="fatherOccupation"
                label="Occupation"
                register={register}
                error={errors.fatherOccupation?.message}
                disabled={isPending}
                placeholder="Occupation"
              />

              <TextField
                name="fatherContact"
                label="Contact Number"
                register={register}
                error={errors.fatherContact?.message}
                disabled={isPending}
                type="tel"
                placeholder="+63 9XX-XXX-XXXX"
              />
            </div>
          </div>

          {/* Mother's Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Mother&apos;s Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                name="motherMaidenName"
                label="Maiden Name"
                register={register}
                error={errors.motherMaidenName?.message}
                disabled={isPending}
                placeholder="Mother's maiden name"
              />

              <TextField
                name="motherOccupation"
                label="Occupation"
                register={register}
                error={errors.motherOccupation?.message}
                disabled={isPending}
                placeholder="Occupation"
              />

              <TextField
                name="motherContact"
                label="Contact Number"
                register={register}
                error={errors.motherContact?.message}
                disabled={isPending}
                type="tel"
                placeholder="+63 9XX-XXX-XXXX"
              />
            </div>
          </div>

          {/* Siblings Information - keeping dynamic field array structure */}
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
