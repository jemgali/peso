"use client";

import React, { useEffect, useRef } from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel, FieldError } from "@/ui/field";
import { Plus, X } from "lucide-react";
import { TextField } from "@/components/shared";
import { useAutoCapitalize } from "@/hooks/use-auto-capitalize";
import type { FormSectionWithFieldArrayProps } from "./types";

const FamilySection: React.FC<FormSectionWithFieldArrayProps> = ({
  register,
  errors,
  isPending,
  siblingsFieldArray,
  watch,
  setValue,
}) => {
  // Auto-capitalize hook for name fields
  const { handleBlur: autoCapitalizeBlur, toTitleCase } = useAutoCapitalize(setValue);
  
  // Track the previous sibling count to avoid infinite loops
  const prevSiblingCountRef = useRef<number | undefined>(undefined);
  
  // Watch the siblings array for auto-count
  const siblings = watch?.("siblings") || [];
  
  // Auto-update numberOfSiblings when siblings array changes
  useEffect(() => {
    const siblingCount = siblings.length;
    if (prevSiblingCountRef.current !== siblingCount) {
      prevSiblingCountRef.current = siblingCount;
      setValue?.("numberOfSiblings", siblingCount);
    }
  }, [siblings.length, setValue]);
  
  // Handle blur for sibling name fields - apply title case
  const handleSiblingNameBlur = (index: number) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && setValue) {
      const capitalizedValue = toTitleCase(value);
      setValue(`siblings.${index}.name` as const, capitalizedValue);
    }
  };
  
  return (
    <div id="family" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Family Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your family members. Parent names are required.
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
                required
                onBlur={autoCapitalizeBlur("fatherName")}
              />

              <TextField
                name="fatherOccupation"
                label="Occupation (Optional)"
                register={register}
                error={errors.fatherOccupation?.message}
                disabled={isPending}
                placeholder="Occupation"
                onBlur={autoCapitalizeBlur("fatherOccupation")}
              />

              <TextField
                name="fatherContact"
                label="Contact Number (Optional)"
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
                required
                onBlur={autoCapitalizeBlur("motherMaidenName")}
              />

              <TextField
                name="motherOccupation"
                label="Occupation (Optional)"
                register={register}
                error={errors.motherOccupation?.message}
                disabled={isPending}
                placeholder="Occupation"
                onBlur={autoCapitalizeBlur("motherOccupation")}
              />

              <TextField
                name="motherContact"
                label="Contact Number (Optional)"
                register={register}
                error={errors.motherContact?.message}
                disabled={isPending}
                type="tel"
                placeholder="+63 9XX-XXX-XXXX"
              />
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
                  Add information about your siblings (name and age are required if a sibling is added)
                </p>
              </div>
              <Field data-invalid={!!errors.numberOfSiblings} className="w-32">
                <FieldLabel htmlFor="numberOfSiblings">Total</FieldLabel>
                <Input
                  {...register("numberOfSiblings")}
                  type="number"
                  id="numberOfSiblings"
                  disabled
                  readOnly
                  placeholder="0"
                  min={0}
                  className="bg-muted cursor-not-allowed"
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
                    <div className="space-y-1">
                      <Input
                        {...register(`siblings.${index}.name` as const)}
                        type="text"
                        disabled={isPending}
                        placeholder="Full Name *"
                        onBlur={handleSiblingNameBlur(index)}
                      />
                      {errors.siblings?.[index]?.name && (
                        <FieldError className="text-xs">
                          {errors.siblings[index].name?.message}
                        </FieldError>
                      )}
                    </div>
                    <Input
                      {...register(`siblings.${index}.age` as const, { 
                        valueAsNumber: true,
                        setValueAs: (v) => v === "" ? undefined : Number(v)
                      })}
                      type="number"
                      disabled={isPending}
                      placeholder="Age *"
                      min={1}
                    />
                    {errors.siblings?.[index]?.age && (
                      <FieldError className="text-xs">
                        {errors.siblings[index].age?.message}
                      </FieldError>
                    )}
                    <Input
                      {...register(`siblings.${index}.occupation` as const)}
                      type="text"
                      disabled={isPending}
                      placeholder="Occupation (Optional)"
                    />
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
                  siblingsFieldArray?.append({ name: "", age: 0, occupation: "" })
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
