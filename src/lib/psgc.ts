/**
 * PSGC (Philippine Standard Geographic Code) API Service
 * https://psgc.cloud/api-docs
 */

// ============================================
// Types
// ============================================

export interface PSGCProvince {
  code: string;
  name: string;
}

export interface PSGCCityMunicipality {
  code: string;
  name: string;
  type: "City" | "Mun";
  district?: string;
  zip_code?: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  status?: string;
}

// NCR Region code
const NCR_REGION_CODE = "130000000";

// Cache for API responses to avoid repeated calls
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

// ============================================
// Cache Helpers
// ============================================

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch all provinces from PSGC API
 * Includes NCR as "Metro Manila" for consistency
 */
export async function fetchProvinces(): Promise<PSGCProvince[]> {
  const cacheKey = "provinces";
  const cached = getCached<PSGCProvince[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://psgc.cloud/api/provinces");
    if (!response.ok) {
      throw new Error(`Failed to fetch provinces: ${response.statusText}`);
    }

    const provinces: PSGCProvince[] = await response.json();

    // Add NCR (Metro Manila) as a special "province" option
    // It uses the NCR region code since NCR doesn't have provinces
    const withNCR: PSGCProvince[] = [
      { code: NCR_REGION_CODE, name: "Metro Manila (NCR)" },
      ...provinces.sort((a, b) => a.name.localeCompare(b.name)),
    ];

    setCache(cacheKey, withNCR);
    return withNCR;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
}

/**
 * Fetch cities and municipalities by province code
 * For NCR, fetches directly from the region endpoint
 */
export async function fetchCitiesMunicipalities(
  provinceCode: string
): Promise<PSGCCityMunicipality[]> {
  if (!provinceCode) return [];

  const cacheKey = `cities-${provinceCode}`;
  const cached = getCached<PSGCCityMunicipality[]>(cacheKey);
  if (cached) return cached;

  try {
    let url: string;

    // NCR has a different structure - cities are directly under the region
    if (provinceCode === NCR_REGION_CODE) {
      url = `https://psgc.cloud/api/regions/${NCR_REGION_CODE}/cities-municipalities`;
    } else {
      url = `https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch cities/municipalities: ${response.statusText}`
      );
    }

    const cities: PSGCCityMunicipality[] = await response.json();
    const sorted = cities.sort((a, b) => a.name.localeCompare(b.name));

    setCache(cacheKey, sorted);
    return sorted;
  } catch (error) {
    console.error("Error fetching cities/municipalities:", error);
    throw error;
  }
}

/**
 * Fetch barangays by city/municipality code
 */
export async function fetchBarangays(
  cityMunicipalityCode: string
): Promise<PSGCBarangay[]> {
  if (!cityMunicipalityCode) return [];

  const cacheKey = `barangays-${cityMunicipalityCode}`;
  const cached = getCached<PSGCBarangay[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://psgc.cloud/api/cities-municipalities/${cityMunicipalityCode}/barangays`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch barangays: ${response.statusText}`);
    }

    const barangays: PSGCBarangay[] = await response.json();
    const sorted = barangays.sort((a, b) => a.name.localeCompare(b.name));

    setCache(cacheKey, sorted);
    return sorted;
  } catch (error) {
    console.error("Error fetching barangays:", error);
    throw error;
  }
}

/**
 * Check if a province code is NCR
 */
export function isNCR(provinceCode: string): boolean {
  return provinceCode === NCR_REGION_CODE;
}

/**
 * Get display name for city/municipality
 * Includes type indicator (City/Municipality)
 */
export function getCityDisplayName(city: PSGCCityMunicipality): string {
  const typeLabel = city.type === "City" ? "City" : "Municipality";
  return `${city.name} (${typeLabel})`;
}

/**
 * Clear all cached data
 * Useful for forcing fresh data
 */
export function clearPSGCCache(): void {
  cache.clear();
}
