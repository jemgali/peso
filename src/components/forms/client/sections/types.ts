import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFieldArrayReturn,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import type { SPESApplicationFormValues } from "@/lib/validations/spes-application";

// Common props interface for all form sections
export interface FormSectionProps {
  register: UseFormRegister<SPESApplicationFormValues>;
  errors: FieldErrors<SPESApplicationFormValues>;
  isPending: boolean;
  /** User email from auth session for pre-filling */
  userEmail?: string;
  /** Watch function for form values */
  watch?: UseFormWatch<SPESApplicationFormValues>;
  /** SetValue function for programmatic form updates */
  setValue?: UseFormSetValue<SPESApplicationFormValues>;
  /** Full form values */
  formValues?: SPESApplicationFormValues;
  /** SPES application type (New vs Baby) */
  applicationType?: "new" | "spes-baby";
  /** Feedback from admin if application needs revision */
  revisionFeedback?: Record<string, string>;
}

// Extended props for sections that need control (for Controller components)
export interface FormSectionWithControlProps extends FormSectionProps {
  control: Control<SPESApplicationFormValues>;
}

// Extended props for sections with field arrays
export interface FormSectionWithFieldArrayProps extends FormSectionWithControlProps {
  siblingsFieldArray?: UseFieldArrayReturn<SPESApplicationFormValues, "siblings">;
  skillsFieldArray?: UseFieldArrayReturn<SPESApplicationFormValues, "skills">;
  languageFieldArray?: UseFieldArrayReturn<SPESApplicationFormValues, "profileLanguageDialect">;
  spesAvailmentsFieldArray?: UseFieldArrayReturn<SPESApplicationFormValues, "spesAvailments">;
}

// Props for the review section which needs form values
export interface ReviewSectionProps {
  formValues: SPESApplicationFormValues;
  isPending: boolean;
  isValid: boolean;
  onSubmitRequest: () => void;
  errors?: FieldErrors<SPESApplicationFormValues>;
  incompleteSections?: string[];
  triggerValidation?: () => Promise<boolean>;
}

// Re-export validation types for convenience
export type { SPESApplicationFormValues } from "@/lib/validations/spes-application";
