import React from "react"
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@/ui/field"
import { Input } from "@/ui/input"

export interface TextFieldProps<TFieldValues extends FieldValues> {
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
  /** Input type (text, email, password, tel, url, number) */
  type?: "text" | "email" | "password" | "tel" | "url" | "number"
  /** Placeholder text */
  placeholder?: string
  /** Auto-capitalize setting */
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Additional className for the input */
  className?: string
  /** Register options (e.g., valueAsNumber for number inputs) */
  registerOptions?: Parameters<UseFormRegister<TFieldValues>>[1]
  /** Custom onBlur handler (runs after register's onBlur) */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  /** Custom onChange handler (runs before register's onChange) */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Input max length */
  maxLength?: number
}

export function TextField<TFieldValues extends FieldValues>({
  name,
  label,
  register,
  error,
  disabled = false,
  type = "text",
  placeholder,
  autoCapitalize,
  required = false,
  className,
  registerOptions,
  onBlur,
  onChange,
  maxLength,
}: TextFieldProps<TFieldValues>) {
  const { onBlur: registerOnBlur, onChange: registerOnChange, ...restRegister } = register(name, registerOptions)
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call register's onBlur first
    registerOnBlur(e)
    // Then call custom onBlur if provided
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow custom formatting/masking before RHF reads the value
    onChange?.(e)
    registerOnChange(e)
  }
  
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Input
        {...restRegister}
        onBlur={handleBlur}
        onChange={handleChange}
        type={type}
        id={name}
        disabled={disabled}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        className={className}
        maxLength={maxLength}
        aria-invalid={!!error}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
