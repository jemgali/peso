import React from "react";
import { FieldSet, FieldGroup } from "@/ui/field";
import { TextField, TextareaField } from "@/components/shared";
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
          <TextareaField
            name="profileHouseStreet"
            label="House/Unit No., Street, Subdivision"
            register={register}
            error={errors.profileHouseStreet?.message}
            disabled={isPending}
            placeholder="House/Unit No., Street, Subdivision/Village"
            className="min-h-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              name="profileBarangay"
              label="Barangay"
              register={register}
              error={errors.profileBarangay?.message}
              disabled={isPending}
              placeholder="Barangay name"
            />

            <TextField
              name="profileMunicipality"
              label="Municipality/City"
              register={register}
              error={errors.profileMunicipality?.message}
              disabled={isPending}
              placeholder="City or Municipality"
            />

            <TextField
              name="profileProvince"
              label="Province"
              register={register}
              error={errors.profileProvince?.message}
              disabled={isPending}
              placeholder="Province name"
            />
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default AddressSection;
