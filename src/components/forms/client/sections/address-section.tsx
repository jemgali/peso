import React from "react";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionProps } from "./types";

const AddressSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
}) => {
  return (
    <div
      id="address"
      ref={setSectionRef("address")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Address Information</h2>
        <p className="text-sm text-muted-foreground">
          Where do you currently reside?
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.presentAddress}>
            <FieldLabel htmlFor="presentAddress">Present Address</FieldLabel>
            <Textarea
              {...register("presentAddress")}
              id="presentAddress"
              disabled={isPending}
              placeholder="House/Unit No., Street, Subdivision/Village"
              aria-invalid={!!errors.presentAddress}
              className="min-h-20"
            />
            {errors.presentAddress && (
              <FieldError>{errors.presentAddress.message}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field data-invalid={!!errors.barangay}>
              <FieldLabel htmlFor="barangay">Barangay</FieldLabel>
              <Input
                {...register("barangay")}
                type="text"
                id="barangay"
                disabled={isPending}
                placeholder="Barangay name"
                aria-invalid={!!errors.barangay}
              />
              {errors.barangay && (
                <FieldError>{errors.barangay.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.municipality}>
              <FieldLabel htmlFor="municipality">Municipality/City</FieldLabel>
              <Input
                {...register("municipality")}
                type="text"
                id="municipality"
                disabled={isPending}
                placeholder="City or Municipality"
                aria-invalid={!!errors.municipality}
              />
              {errors.municipality && (
                <FieldError>{errors.municipality.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.province}>
              <FieldLabel htmlFor="province">Province</FieldLabel>
              <Input
                {...register("province")}
                type="text"
                id="province"
                disabled={isPending}
                placeholder="Province name"
                aria-invalid={!!errors.province}
              />
              {errors.province && (
                <FieldError>{errors.province.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default AddressSection;
