import React from "react"
import { Field, FieldLabel, FieldError } from "@/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps {
  /** Unique field name/id */
  name: string
  /** Field label */
  label: string
  /** Current selected value */
  value: string | undefined
  /** Callback when value changes */
  onValueChange: (value: string) => void
  /** Array of options to display */
  options: SelectOption[]
  /** Error message (if any) */
  error?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Additional className for the trigger */
  className?: string
}

export function SelectField({
  name,
  label,
  value,
  onValueChange,
  options,
  error,
  disabled = false,
  placeholder = "Select an option",
  required = false,
  className,
}: SelectFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={name} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
