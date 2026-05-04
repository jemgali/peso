"use client";

import { useEffect, useRef, useCallback } from "react";
import type { UseFormWatch, UseFormSetValue, FieldValues, Path, PathValue } from "react-hook-form";

interface UseFormPersistenceOptions<T extends FieldValues> {
  /** Unique storage key (e.g. `spes-form-${userId}`) */
  key: string;
  /** react-hook-form watch function */
  watch: UseFormWatch<T>;
  /** react-hook-form setValue function */
  setValue: UseFormSetValue<T>;
  /** Server-fetched defaults take priority over localStorage */
  defaultValues?: Record<string, unknown>;
  /** Fields to exclude from persistence (e.g. file uploads) */
  excludeFields?: string[];
  /** Debounce interval in ms (default: 500) */
  debounceMs?: number;
}

const STORAGE_PREFIX = "peso_form_";

/**
 * Auto-save form state to localStorage on every change.
 * Restores on mount, merging under server-fetched defaults.
 * Clears on explicit call to `clearPersistedData()`.
 */
export function useFormPersistence<T extends FieldValues>({
  key,
  watch,
  setValue,
  defaultValues,
  excludeFields = [],
  debounceMs = 500,
}: UseFormPersistenceOptions<T>) {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const hasRestoredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore persisted data on mount (once)
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const persisted = JSON.parse(raw) as Record<string, unknown>;
      if (!persisted || typeof persisted !== "object") return;

      // Only restore fields that are NOT already set by server defaults
      const entries = Object.entries(persisted);
      for (const [field, value] of entries) {
        if (excludeFields.includes(field)) continue;

        // Server default takes priority if it has a meaningful value
        const serverValue = defaultValues?.[field];
        const serverHasValue = hasValue(serverValue);

        if (!serverHasValue && hasValue(value)) {
          setValue(field as Path<T>, value as PathValue<T, Path<T>>, {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false,
          });
        }
      }
    } catch {
      // Corrupted data — ignore
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch all fields and debounce-save to localStorage
  useEffect(() => {
    const subscription = watch((formValues) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        try {
          const toSave = { ...formValues } as Record<string, unknown>;
          // Strip excluded fields
          for (const field of excludeFields) {
            delete toSave[field];
          }
          localStorage.setItem(storageKey, JSON.stringify(toSave));
        } catch {
          // Storage full or unavailable — fail silently
        }
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [watch, storageKey, excludeFields, debounceMs]);

  /** Clear persisted data (call on successful submission) */
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return { clearPersistedData };
}

/** Check if a value is "meaningful" (non-empty) */
function hasValue(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}
