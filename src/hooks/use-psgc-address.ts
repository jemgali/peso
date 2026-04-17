"use client";

import { useState, useEffect, useCallback } from "react";
import { UseFormSetValue, FieldValues, Path, PathValue } from "react-hook-form";
import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  fetchBarangays,
  type PSGCProvince,
  type PSGCCityMunicipality,
  type PSGCBarangay,
} from "@/lib/psgc";

function normalizeLocationName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^city of\s+/g, "")
    .replace(/^municipality of\s+/g, "")
    .replace(/[\s,.-]/g, "")
    .trim();
}

function isLikelyNameMatch(source: string, target: string): boolean {
  const normalizedSource = normalizeLocationName(source);
  const normalizedTarget = normalizeLocationName(target);

  if (!normalizedSource || !normalizedTarget) return false;
  return (
    normalizedSource === normalizedTarget ||
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource)
  );
}

/**
 * Hook options for PSGC address selection
 */
interface UsePsgcAddressOptions<TFieldValues extends FieldValues> {
  /** setValue function from react-hook-form */
  setValue: UseFormSetValue<TFieldValues>;
  /** Field names for the address fields */
  fieldNames: {
    province: Path<TFieldValues>;
    municipality: Path<TFieldValues>;
    barangay: Path<TFieldValues>;
  };
  /** Initial values (for pre-filling from saved data) */
  initialValues?: {
    province?: string;
    municipality?: string;
    barangay?: string;
  };
  /** Whether to trigger validation after setting value */
  shouldValidate?: boolean;
}

/**
 * Return type for the hook
 */
interface UsePsgcAddressReturn {
  // Data
  provinces: PSGCProvince[];
  citiesMunicipalities: PSGCCityMunicipality[];
  barangays: PSGCBarangay[];

  // Selected values (for controlled components)
  selectedProvince: string;
  selectedMunicipality: string;
  selectedBarangay: string;

  // Loading states
  isLoadingProvinces: boolean;
  isLoadingCities: boolean;
  isLoadingBarangays: boolean;

  // Handlers
  handleProvinceChange: (value: string, name?: string) => void;
  handleMunicipalityChange: (value: string, name?: string) => void;
  handleBarangayChange: (value: string, name?: string) => void;

  // Error state
  error: string | null;
}

/**
 * Hook for cascading PSGC address selection
 *
 * Handles the province → city/municipality → barangay flow with:
 * - Auto-loading of dependent data
 * - Auto-clearing of child selections when parent changes
 * - Loading states for each level
 * - Caching via the PSGC service
 *
 * @example
 * ```tsx
 * const {
 *   provinces,
 *   citiesMunicipalities,
 *   barangays,
 *   selectedProvince,
 *   handleProvinceChange,
 *   isLoadingProvinces,
 * } = usePsgcAddress({
 *   setValue,
 *   fieldNames: {
 *     province: "profileProvince",
 *     municipality: "profileMunicipality",
 *     barangay: "profileBarangay",
 *   },
 * });
 * ```
 */
export function usePsgcAddress<TFieldValues extends FieldValues>({
  setValue,
  fieldNames,
  initialValues,
  shouldValidate = true,
}: UsePsgcAddressOptions<TFieldValues>): UsePsgcAddressReturn {
  // Data states
  const [provinces, setProvinces] = useState<PSGCProvince[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<
    PSGCCityMunicipality[]
  >([]);
  const [barangays, setBarangays] = useState<PSGCBarangay[]>([]);

  // Selected codes (for API calls)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState("");

  // Selected names (for form values)
  const [selectedProvince, setSelectedProvince] = useState(
    initialValues?.province || ""
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    initialValues?.municipality || ""
  );
  const [selectedBarangay, setSelectedBarangay] = useState(
    initialValues?.barangay || ""
  );

  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    let mounted = true;

    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        setError(null);
        const data = await fetchProvinces();
        if (mounted) {
          setProvinces(data);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load provinces");
          console.error(err);
        }
      } finally {
        if (mounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    loadProvinces();

    return () => {
      mounted = false;
    };
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCitiesMunicipalities([]);
      return;
    }

    let mounted = true;

    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        setError(null);
        const data = await fetchCitiesMunicipalities(selectedProvinceCode);
        if (mounted) {
          setCitiesMunicipalities(data);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load cities/municipalities");
          console.error(err);
        }
      } finally {
        if (mounted) {
          setIsLoadingCities(false);
        }
      }
    };

    loadCities();

    return () => {
      mounted = false;
    };
  }, [selectedProvinceCode]);

  // Hydrate initial province name to PSGC province code
  useEffect(() => {
    if (selectedProvinceCode || !selectedProvince || provinces.length === 0) {
      return;
    }

    const provinceMatch = provinces.find((province) =>
      isLikelyNameMatch(province.name, selectedProvince)
    );

    if (provinceMatch) {
      setSelectedProvinceCode(provinceMatch.code);
    }
  }, [selectedProvinceCode, selectedProvince, provinces]);

  // Load barangays when city/municipality changes
  useEffect(() => {
    if (!selectedMunicipalityCode) {
      setBarangays([]);
      return;
    }

    let mounted = true;

    const loadBarangays = async () => {
      try {
        setIsLoadingBarangays(true);
        setError(null);
        const data = await fetchBarangays(selectedMunicipalityCode);
        if (mounted) {
          setBarangays(data);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load barangays");
          console.error(err);
        }
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
  }, [selectedMunicipalityCode]);

  // Hydrate initial municipality/city name to PSGC code
  useEffect(() => {
    if (
      selectedMunicipalityCode ||
      !selectedMunicipality ||
      citiesMunicipalities.length === 0
    ) {
      return;
    }

    const municipalityMatch = citiesMunicipalities.find((city) =>
      isLikelyNameMatch(city.name, selectedMunicipality)
    );

    if (municipalityMatch) {
      setSelectedMunicipalityCode(municipalityMatch.code);
    }
  }, [selectedMunicipalityCode, selectedMunicipality, citiesMunicipalities]);

  // Handle province selection
  const handleProvinceChange = useCallback(
    (code: string, name?: string) => {
      const province = provinces.find((p) => p.code === code);
      const provinceName = name || province?.name || "";

      setSelectedProvinceCode(code);
      setSelectedProvince(provinceName);

      // Clear dependent selections
      setSelectedMunicipalityCode("");
      setSelectedMunicipality("");
      setSelectedBarangay("");
      setCitiesMunicipalities([]);
      setBarangays([]);

      // Update form values
      setValue(fieldNames.province, provinceName as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
      setValue(fieldNames.municipality, "" as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
      setValue(fieldNames.barangay, "" as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
    },
    [provinces, setValue, fieldNames, shouldValidate]
  );

  // Handle city/municipality selection
  const handleMunicipalityChange = useCallback(
    (code: string, name?: string) => {
      const city = citiesMunicipalities.find((c) => c.code === code);
      const cityName = name || city?.name || "";

      setSelectedMunicipalityCode(code);
      setSelectedMunicipality(cityName);

      // Clear dependent selection
      setSelectedBarangay("");
      setBarangays([]);

      // Update form values
      setValue(fieldNames.municipality, cityName as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
      setValue(fieldNames.barangay, "" as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
    },
    [citiesMunicipalities, setValue, fieldNames, shouldValidate]
  );

  // Handle barangay selection
  const handleBarangayChange = useCallback(
    (code: string, name?: string) => {
      const barangay = barangays.find((b) => b.code === code);
      const barangayName = name || barangay?.name || "";

      setSelectedBarangay(barangayName);

      // Update form value
      setValue(fieldNames.barangay, barangayName as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
    },
    [barangays, setValue, fieldNames, shouldValidate]
  );

  return {
    // Data
    provinces,
    citiesMunicipalities,
    barangays,

    // Selected values
    selectedProvince,
    selectedMunicipality,
    selectedBarangay,

    // Loading states
    isLoadingProvinces,
    isLoadingCities,
    isLoadingBarangays,

    // Handlers
    handleProvinceChange,
    handleMunicipalityChange,
    handleBarangayChange,

    // Error
    error,
  };
}

export default usePsgcAddress;
