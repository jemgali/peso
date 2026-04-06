import type {
  UseFormRegister,
  FieldErrors,
  Control,
} from "react-hook-form";
import type { SPESApplicationFormValues } from "@/lib/validations/spes-application";

// Common props interface for all form sections
export interface FormSectionProps {
  register: UseFormRegister<SPESApplicationFormValues>;
  errors: FieldErrors<SPESApplicationFormValues>;
  isPending: boolean;
  setSectionRef: (id: string) => (el: HTMLDivElement | null) => void;
}

// Extended props for sections that need control (for Controller components)
export interface FormSectionWithControlProps extends FormSectionProps {
  control: Control<SPESApplicationFormValues>;
}

// Props for the review section which needs form values
export interface ReviewSectionProps {
  formValues: SPESApplicationFormValues;
  isPending: boolean;
  isValid: boolean;
  setSectionRef: (id: string) => (el: HTMLDivElement | null) => void;
}

// Re-export validation types for convenience
export type { SPESApplicationFormValues } from "@/lib/validations/spes-application";
