"use client";

import { useCallback } from "react";
import { UseFormSetValue, FieldValues, Path, PathValue } from "react-hook-form";

/**
 * Common name particles that should remain lowercase (unless at the start)
 */
const LOWERCASE_PARTICLES = new Set([
  "de",
  "dela",
  "del",
  "la",
  "las",
  "los",
  "van",
  "von",
  "di",
  "da",
  "das",
  "dos",
  "du",
  "le",
  "el",
]);

/**
 * Prefixes that should have special capitalization (e.g., McDonald, O'Brien)
 */
const SPECIAL_PREFIXES = ["mc", "mac", "o'"];

/**
 * Convert a single word to Title Case with special handling
 */
function capitalizeWord(word: string, isFirstWord: boolean): string {
  if (!word) return word;

  const lowerWord = word.toLowerCase();

  // Handle particles (de, dela, del, van, etc.) - keep lowercase unless first word
  if (LOWERCASE_PARTICLES.has(lowerWord) && !isFirstWord) {
    return lowerWord;
  }

  // Handle special prefixes (Mc, Mac, O')
  for (const prefix of SPECIAL_PREFIXES) {
    if (lowerWord.startsWith(prefix) && lowerWord.length > prefix.length) {
      const rest = lowerWord.slice(prefix.length);
      if (prefix === "o'") {
        // O'Brien → O'Brien
        return "O'" + rest.charAt(0).toUpperCase() + rest.slice(1);
      }
      // McDonald, MacDonald
      return (
        prefix.charAt(0).toUpperCase() +
        prefix.slice(1) +
        rest.charAt(0).toUpperCase() +
        rest.slice(1)
      );
    }
  }

  // Standard Title Case
  return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
}

/**
 * Convert a string to Title Case with smart handling of:
 * - Name particles (de la, del, van, von, etc.)
 * - Special prefixes (Mc, Mac, O')
 * - Multiple words
 *
 * @example
 * toTitleCase("JUAN DELA CRUZ") // "Juan dela Cruz"
 * toTitleCase("mcdonald") // "McDonald"
 * toTitleCase("o'brien") // "O'Brien"
 * toTitleCase("maria van dijk") // "Maria van Dijk"
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== "string") return str;

  // Handle hyphenated names
  const processHyphenated = (part: string, isFirst: boolean): string => {
    const hyphenParts = part.split("-");
    return hyphenParts
      .map((hp, hpIndex) => capitalizeWord(hp, isFirst && hpIndex === 0))
      .join("-");
  };

  // Split by spaces and process each word
  const words = str.trim().split(/\s+/);

  return words
    .map((word, index) => processHyphenated(word, index === 0))
    .join(" ");
}

/**
 * Hook to auto-capitalize form field values on blur
 *
 * @example
 * ```tsx
 * const { handleBlur, capitalize, toTitleCase } = useAutoCapitalize(setValue);
 *
 * // Use with onBlur
 * <Input onBlur={handleBlur("profileLastName")} />
 *
 * // Or capitalize directly
 * const formatted = capitalize(value);
 * ```
 */
export function useAutoCapitalize<TFieldValues extends FieldValues>(
  setValue?: UseFormSetValue<TFieldValues>,
  shouldValidate = true
) {
  /**
   * Handle blur event - auto-capitalize the field value
   */
  const handleBlur = useCallback(
    (fieldName: Path<TFieldValues>) =>
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!setValue) return;
        const value = e.target.value;
        if (value && typeof value === "string") {
          const capitalized = toTitleCase(value);
          if (capitalized !== value) {
            setValue(fieldName, capitalized as PathValue<TFieldValues, Path<TFieldValues>>, {
              shouldValidate,
            });
          }
        }
      },
    [setValue, shouldValidate]
  );

  /**
   * Capitalize a string value directly
   */
  const capitalize = useCallback((value: string): string => {
    return toTitleCase(value);
  }, []);

  /**
   * Set a field value with auto-capitalization
   */
  const setCapitalizedValue = useCallback(
    (fieldName: Path<TFieldValues>, value: string) => {
      if (!setValue) return;
      const capitalized = toTitleCase(value);
      setValue(fieldName, capitalized as PathValue<TFieldValues, Path<TFieldValues>>, {
        shouldValidate,
      });
    },
    [setValue, shouldValidate]
  );

  return {
    handleBlur,
    capitalize,
    setCapitalizedValue,
    toTitleCase,
  };
}

export default useAutoCapitalize;
