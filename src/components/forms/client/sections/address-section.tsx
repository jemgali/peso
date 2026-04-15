"use client";

import React from "react";
import { FieldSet, FieldGroup, FieldLabel, FieldError } from "@/ui/field";
import { TextareaField } from "@/components/shared";
import { Input } from "@/ui/input";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/ui/combobox";
import { usePsgcAddress } from "@/hooks/use-psgc-address";
import { useAutoCapitalize } from "@/hooks/use-auto-capitalize";
import type { FormSectionProps } from "./types";

// Locked address values for Baguio City
const LOCKED_PROVINCE = "Benguet";
const LOCKED_CITY = "Baguio City";

const AddressSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  watch,
  setValue,
  formValues,
}) => {
  // Auto-capitalize for house/street field
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);
  
  const currentBarangay = formValues?.profileBarangay || "";
  
  // Auto-set province and city on mount
  React.useEffect(() => {
    if (setValue) {
      setValue("profileProvince", LOCKED_PROVINCE, { shouldValidate: true });
      setValue("profileMunicipality", LOCKED_CITY, { shouldValidate: true });
    }
  }, [setValue]);
  
  // PSGC address hook — only for barangay selection within Baguio
  const {
    barangays,
    selectedBarangay,
    isLoadingBarangays,
    handleBarangayChange,
  } = usePsgcAddress({
    setValue: setValue!,
    fieldNames: {
      province: "profileProvince",
      municipality: "profileMunicipality",
      barangay: "profileBarangay",
    },
    initialValues: {
      province: LOCKED_PROVINCE,
      municipality: LOCKED_CITY,
      barangay: currentBarangay,
    },
  });
  
  // Filter barangays by search
  const [barangaySearch, setBarangaySearch] = React.useState("");
  
  const filteredBarangays = React.useMemo(() => {
    if (!barangaySearch) return barangays;
    const search = barangaySearch.toLowerCase();
    return barangays.filter((b) => b.name.toLowerCase().includes(search));
  }, [barangays, barangaySearch]);

  return (
    <div id="address" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Address Information</h2>
        <p className="text-sm text-muted-foreground">
          Where do you currently reside? Province and City are locked to Baguio City, Benguet.
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
            required
            onBlur={autoCapitalizeBlur("profileHouseStreet")}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province — Locked */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="profileProvince" required>Province</FieldLabel>
              <Input
                value={LOCKED_PROVINCE}
                disabled
                readOnly
                className="bg-muted"
              />
              {errors.profileProvince && (
                <FieldError>{errors.profileProvince.message}</FieldError>
              )}
            </div>

            {/* City/Municipality — Locked */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="profileMunicipality" required>Municipality/City</FieldLabel>
              <Input
                value={LOCKED_CITY}
                disabled
                readOnly
                className="bg-muted"
              />
              {errors.profileMunicipality && (
                <FieldError>{errors.profileMunicipality.message}</FieldError>
              )}
            </div>

            {/* Barangay Combobox — Only editable field */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="profileBarangay" required>Barangay</FieldLabel>
              <Combobox<string>
                inputValue={barangaySearch}
                onInputValueChange={(value) => setBarangaySearch(value ?? "")}
                value={selectedBarangay}
                onValueChange={(value) => {
                  const barangay = barangays.find((b) => b.name === value);
                  if (barangay) {
                    handleBarangayChange(barangay.code, barangay.name);
                    setBarangaySearch("");
                  }
                }}
              >
                <ComboboxInput
                  placeholder={
                    isLoadingBarangays 
                      ? "Loading..." 
                      : "Select barangay"
                  }
                  disabled={isPending || isLoadingBarangays}
                  showTrigger
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredBarangays.length === 0 && (
                      <ComboboxEmpty>
                        {isLoadingBarangays ? "Loading barangays..." : "No barangay found"}
                      </ComboboxEmpty>
                    )}
                    {filteredBarangays.map((barangay) => (
                      <ComboboxItem key={barangay.code} value={barangay.name}>
                        {barangay.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.profileBarangay && (
                <FieldError>{errors.profileBarangay.message}</FieldError>
              )}
            </div>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default AddressSection;
