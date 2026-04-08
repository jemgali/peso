import React from "react"
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@/ui/field"
import { Textarea } from "@/ui/textarea"

export interface TextareaFieldProps<TFieldValues extends FieldValues> {
  /** Field name (must match form schema) */
  name: FieldPath<TFieldValues>
  /** Field label */
  label: string
  /** Register function from useForm */
  register: UseFormRegister<TFieldValues>
  /** Error message (if any) */
  error?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Number of visible text rows */
  rows?: number
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Additional className for the textarea */
  className?: string
}

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  label,
  register,
  error,
  disabled = false,
  placeholder,
  rows = 3,
  required = false,
  className,
}: TextareaFieldProps<TFieldValues>) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Textarea
        {...register(name)}
        id={name}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={className}
        aria-invalid={!!error}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
