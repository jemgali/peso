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
import { useAutoCapitalize } from "@/hooks/use-auto-capitalize";
import type { FormSectionProps } from "./types";

// Locked address values for Baguio City
const LOCKED_PROVINCE = "Benguet";
const LOCKED_CITY = "Baguio City";

const AddressSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setValue,
  formValues,
}) => {
  // Auto-capitalize for house/street field
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);

  const currentBarangay = formValues?.profileBarangay || "";
  const [barangays, setBarangays] = React.useState<string[]>([]);
  const [selectedBarangay, setSelectedBarangay] = React.useState(currentBarangay);
  const [isLoadingBarangays, setIsLoadingBarangays] = React.useState(true);
  const [barangayLoadError, setBarangayLoadError] = React.useState<string | null>(null);

  // Auto-set province and city on mount
  React.useEffect(() => {
    if (setValue) {
      setValue("profileProvince", LOCKED_PROVINCE, { shouldValidate: true });
      setValue("profileMunicipality", LOCKED_CITY, { shouldValidate: true });
    }
  }, [setValue]);

  React.useEffect(() => {
    setSelectedBarangay(currentBarangay);
  }, [currentBarangay]);

  React.useEffect(() => {
    let mounted = true;

    const loadBarangays = async () => {
      try {
        setIsLoadingBarangays(true);
        setBarangayLoadError(null);

        const response = await fetch("/data/barangay-list.json");
        if (!response.ok) {
          throw new Error(`Failed to load barangay list: ${response.statusText}`);
        }

        const json: unknown = await response.json();
        let names: string[] = [];

        if (Array.isArray(json)) {
          names = json.filter((value): value is string => typeof value === "string");
        } else if (json && typeof json === "object") {
          names = Object.keys(json as Record<string, unknown>);
        }

        const uniqueSortedNames = Array.from(
          new Set(names.map((name) => name.trim()).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b));

        if (mounted) {
          setBarangays(uniqueSortedNames);
        }
      } catch (error) {
        if (mounted) {
          setBarangays([]);
          setBarangayLoadError("Failed to load barangays");
        }
        console.error("Error loading barangay list:", error);
      } finally {
        if (mounted) {
          setIsLoadingBarangays(false);
        }
      }
    };

    loadBarangays();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter barangays by search
  const [barangaySearch, setBarangaySearch] = React.useState("");

  const filteredBarangays = React.useMemo(() => {
    if (!barangaySearch) return barangays;
    const search = barangaySearch.toLowerCase();
    return barangays.filter((barangay) => barangay.toLowerCase().includes(search));
  }, [barangays, barangaySearch]);

  return (
    <div id="address" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Address Information</h2>
        <p className="text-sm text-muted-foreground">
          Where do you currently reside? Province and City are locked to Baguio
          City, Benguet.
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
              <FieldLabel htmlFor="profileProvince" required>
                Province
              </FieldLabel>
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
              <FieldLabel htmlFor="profileMunicipality" required>
                Municipality/City
              </FieldLabel>
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
              <FieldLabel htmlFor="profileBarangay" required>
                Barangay
              </FieldLabel>
              <Combobox<string>
                inputValue={barangaySearch}
                onInputValueChange={(value) => setBarangaySearch(value ?? "")}
                value={selectedBarangay}
                onValueChange={(value) => {
                  const nextBarangay = value ?? "";
                  setSelectedBarangay(nextBarangay);
                  if (setValue) {
                    setValue("profileBarangay", nextBarangay, {
                      shouldValidate: true,
                    });
                  }
                  setBarangaySearch("");
                }}
              >
                <ComboboxInput
                  placeholder={
                    isLoadingBarangays ? "Loading..." : "Select barangay"
                  }
                  disabled={isPending || isLoadingBarangays}
                  showTrigger
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredBarangays.length === 0 && (
                      <ComboboxEmpty>
                        {barangayLoadError
                          ? barangayLoadError
                          : isLoadingBarangays
                            ? "Loading barangays..."
                            : "No barangay found"}
                      </ComboboxEmpty>
                    )}
                    {filteredBarangays.map((barangay) => (
                      <ComboboxItem key={barangay} value={barangay}>
                        {barangay}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.profileBarangay && (
                <FieldError>{errors.profileBarangay.message}</FieldError>
              )}
              {!errors.profileBarangay && barangayLoadError && (
                <FieldError>{barangayLoadError}</FieldError>
              )}
            </div>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default AddressSection;
