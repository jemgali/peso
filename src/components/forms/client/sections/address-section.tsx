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
}) => {
  return (
    <div id="address" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Address Information</h2>
        <p className="text-sm text-muted-foreground">
          Where do you currently reside?
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.profileHouseStreet}>
            <FieldLabel htmlFor="profileHouseStreet">
              House/Unit No., Street, Subdivision
            </FieldLabel>
            <Textarea
              {...register("profileHouseStreet")}
              id="profileHouseStreet"
              disabled={isPending}
              placeholder="House/Unit No., Street, Subdivision/Village"
              aria-invalid={!!errors.profileHouseStreet}
              className="min-h-20"
            />
            {errors.profileHouseStreet && (
              <FieldError>{errors.profileHouseStreet.message}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field data-invalid={!!errors.profileBarangay}>
              <FieldLabel htmlFor="profileBarangay">Barangay</FieldLabel>
              <Input
                {...register("profileBarangay")}
                type="text"
                id="profileBarangay"
                disabled={isPending}
                placeholder="Barangay name"
                aria-invalid={!!errors.profileBarangay}
              />
              {errors.profileBarangay && (
                <FieldError>{errors.profileBarangay.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileMunicipality}>
              <FieldLabel htmlFor="profileMunicipality">
                Municipality/City
              </FieldLabel>
              <Input
                {...register("profileMunicipality")}
                type="text"
                id="profileMunicipality"
                disabled={isPending}
                placeholder="City or Municipality"
                aria-invalid={!!errors.profileMunicipality}
              />
              {errors.profileMunicipality && (
                <FieldError>{errors.profileMunicipality.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileProvince}>
              <FieldLabel htmlFor="profileProvince">Province</FieldLabel>
              <Input
                {...register("profileProvince")}
                type="text"
                id="profileProvince"
                disabled={isPending}
                placeholder="Province name"
                aria-invalid={!!errors.profileProvince}
              />
              {errors.profileProvince && (
                <FieldError>{errors.profileProvince.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default AddressSection;
