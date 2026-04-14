"use client";

import React from "react";
import { FieldSet, FieldGroup, FieldLabel, FieldError } from "@/ui/field";
import { TextareaField } from "@/components/shared";
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

const AddressSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  watch,
  setValue,
}) => {
  // Auto-capitalize for house/street field
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);
  
  // Watch values for initial state
  const currentProvince = watch?.("profileProvince") || "";
  const currentCity = watch?.("profileMunicipality") || "";
  const currentBarangay = watch?.("profileBarangay") || "";
  
  // PSGC address hook for cascading selection
  const {
    provinces,
    citiesMunicipalities,
    barangays,
    selectedProvince,
    selectedMunicipality,
    selectedBarangay,
    isLoadingProvinces,
    isLoadingCities,
    isLoadingBarangays,
    handleProvinceChange,
    handleMunicipalityChange,
    handleBarangayChange,
  } = usePsgcAddress({
    setValue: setValue!,
    fieldNames: {
      province: "profileProvince",
      municipality: "profileMunicipality",
      barangay: "profileBarangay",
    },
    initialValues: {
      province: currentProvince,
      municipality: currentCity,
      barangay: currentBarangay,
    },
  });
  
  // Filter provinces by search
  const [provinceSearch, setProvinceSearch] = React.useState("");
  const [citySearch, setCitySearch] = React.useState("");
  const [barangaySearch, setBarangaySearch] = React.useState("");
  
  const filteredProvinces = React.useMemo(() => {
    if (!provinceSearch) return provinces;
    const search = provinceSearch.toLowerCase();
    return provinces.filter((p) => p.name.toLowerCase().includes(search));
  }, [provinces, provinceSearch]);
  
  // Filter cities by search
  const filteredCities = React.useMemo(() => {
    if (!citySearch) return citiesMunicipalities;
    const search = citySearch.toLowerCase();
    return citiesMunicipalities.filter((c) => c.name.toLowerCase().includes(search));
  }, [citiesMunicipalities, citySearch]);
  
  // Filter barangays by search
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
          Where do you currently reside? All fields are required.
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
            {/* Province Combobox */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="profileProvince" required>Province</FieldLabel>
              <Combobox<string>
                inputValue={provinceSearch}
                onInputValueChange={(value) => setProvinceSearch(value ?? "")}
                value={selectedProvince}
                onValueChange={(value) => {
                  const province = provinces.find((p) => p.name === value);
                  if (province) {
                    handleProvinceChange(province.code, province.name);
                    setProvinceSearch("");
                  }
                }}
              >
                <ComboboxInput
                  placeholder={isLoadingProvinces ? "Loading..." : "Select province"}
                  disabled={isPending || isLoadingProvinces}
                  showTrigger
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredProvinces.length === 0 && (
                      <ComboboxEmpty>
                        {isLoadingProvinces ? "Loading provinces..." : "No province found"}
                      </ComboboxEmpty>
                    )}
                    {filteredProvinces.map((province) => (
                      <ComboboxItem key={province.code} value={province.name}>
                        {province.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.profileProvince && (
                <FieldError>{errors.profileProvince.message}</FieldError>
              )}
            </div>

            {/* City/Municipality Combobox */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="profileMunicipality" required>Municipality/City</FieldLabel>
              <Combobox<string>
                inputValue={citySearch}
                onInputValueChange={(value) => setCitySearch(value ?? "")}
                value={selectedMunicipality}
                onValueChange={(value) => {
                  const city = citiesMunicipalities.find((c) => c.name === value);
                  if (city) {
                    handleMunicipalityChange(city.code, city.name);
                    setCitySearch("");
                  }
                }}
              >
                <ComboboxInput
                  placeholder={
                    !selectedProvince 
                      ? "Select province first" 
                      : isLoadingCities 
                        ? "Loading..." 
                        : "Select city/municipality"
                  }
                  disabled={isPending || !selectedProvince || isLoadingCities}
                  showTrigger
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredCities.length === 0 && (
                      <ComboboxEmpty>
                        {isLoadingCities ? "Loading cities..." : "No city found"}
                      </ComboboxEmpty>
                    )}
                    {filteredCities.map((city) => (
                      <ComboboxItem key={city.code} value={city.name}>
                        {city.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.profileMunicipality && (
                <FieldError>{errors.profileMunicipality.message}</FieldError>
              )}
            </div>

            {/* Barangay Combobox */}
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
                    !selectedMunicipality 
                      ? "Select city first" 
                      : isLoadingBarangays 
                        ? "Loading..." 
                        : "Select barangay"
                  }
                  disabled={isPending || !selectedMunicipality || isLoadingBarangays}
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
