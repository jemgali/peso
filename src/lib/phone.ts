const PH_MOBILE_DIGITS = 11;
const PH_MOBILE_FORMAT = /^09\d{2}\s\d{3}\s\d{4}$/;

function stripPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeLeadingDigits(digits: string): string {
  if (digits.startsWith("639")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9")) {
    return `0${digits}`;
  }

  return digits;
}

export function formatPhilippineMobileInput(value: string): string {
  const normalized = normalizeLeadingDigits(stripPhoneDigits(value)).slice(
    0,
    PH_MOBILE_DIGITS,
  );

  if (normalized.length <= 4) return normalized;
  if (normalized.length <= 7) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
  }

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, PH_MOBILE_DIGITS)}`;
}

export function isPhilippineMobileFormatted(value: string): boolean {
  return PH_MOBILE_FORMAT.test(value);
}

export const PHILIPPINE_MOBILE_REGEX = PH_MOBILE_FORMAT;
export const PHILIPPINE_MOBILE_PLACEHOLDER = "09xx xxx xxxx";
export const PHILIPPINE_MOBILE_MAX_LENGTH = 13;
