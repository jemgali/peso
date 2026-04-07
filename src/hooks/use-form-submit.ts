"use client"

import { useState, useCallback } from "react"

export interface UseFormSubmitOptions<TResult> {
  /** URL to submit to */
  url: string
  /** HTTP method */
  method?: "POST" | "PUT" | "PATCH" | "DELETE"
  /** Success callback with result */
  onSuccess?: (result: TResult) => void
  /** Error callback */
  onError?: (error: Error) => void
  /** Success message to show via toast (if provided) */
  successMessage?: string
  /** Error message prefix */
  errorMessage?: string
}

export interface UseFormSubmitReturn<TData, TResult> {
  /** Submit form data */
  submit: (data: TData) => Promise<TResult | null>
  /** Loading state */
  isPending: boolean
  /** Error message if submission failed */
  error: string | null
  /** Reset error state */
  resetError: () => void
}

/**
 * Hook for handling form submissions with loading and error states.
 * 
 * @param options - Configuration options
 * @returns Form submission utilities
 * 
 * @example
 * const { submit, isPending, error } = useFormSubmit<CreateUserData, User>({
 *   url: "/api/admin/users",
 *   method: "POST",
 *   onSuccess: (user) => {
 *     toast.success("User created!")
 *     handleUserCreated(user)
 *   }
 * })
 */
export function useFormSubmit<TData, TResult = unknown>(
  options: UseFormSubmitOptions<TResult>
): UseFormSubmitReturn<TData, TResult> {
  const {
    url,
    method = "POST",
    onSuccess,
    onError,
    errorMessage = "Operation failed",
  } = options

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (data: TData): Promise<TResult | null> => {
      setIsPending(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || `${errorMessage}: ${response.statusText}`)
        }

        const result = await response.json()
        onSuccess?.(result)
        return result
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(errorMessage)
        setError(errorObj.message)
        onError?.(errorObj)
        return null
      } finally {
        setIsPending(false)
      }
    },
    [url, method, onSuccess, onError, errorMessage]
  )

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return {
    submit,
    isPending,
    error,
    resetError,
  }
}
