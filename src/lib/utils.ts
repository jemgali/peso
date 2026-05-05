import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively converts all string values in an object or array to uppercase.
 * Skips specific fields like email or URLs if needed, but for now converts all.
 */
export function toUppercaseValues<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") {
      return obj.toUpperCase() as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toUppercaseValues(item)) as unknown as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Skip fields that should remain lowercase/case-sensitive
      if (
        key.toLowerCase().includes("email") ||
        key.toLowerCase().includes("url") ||
        key.toLowerCase().includes("facebook") ||
        key.toLowerCase().includes("password") ||
        key === "documents" ||
        key === "applicationType"
      ) {
        result[key] = value;
      } else {
        result[key] = toUppercaseValues(value);
      }
    }
  }
  return result as T;
}
