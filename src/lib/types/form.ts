import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFieldArrayReturn,
  UseFormWatch,
  UseFormSetValue,
  FieldValues,
  FieldArrayPath,
} from "react-hook-form"

/**
 * Base props for form sections
 */
export interface FormSectionBaseProps<T extends FieldValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  isPending: boolean
}

/**
 * Props for form sections that need control (for Controller components)
 */
export interface FormSectionWithControlProps<T extends FieldValues>
  extends FormSectionBaseProps<T> {
  control: Control<T>
}

/**
 * Props for form sections with field arrays
 */
export interface FormSectionWithFieldArrayProps<
  T extends FieldValues,
  TFieldArray extends FieldArrayPath<T> = FieldArrayPath<T>,
> extends FormSectionWithControlProps<T> {
  fieldArray?: UseFieldArrayReturn<T, TFieldArray>
  watch?: UseFormWatch<T>
  setValue?: UseFormSetValue<T>
}

/**
 * Props for review sections that display form data
 */
export interface ReviewSectionProps<T> {
  formValues: T
  isPending: boolean
  isValid: boolean
  onSubmitRequest: () => void
}

/**
 * Form dialog mode
 */
export type FormDialogMode = "create" | "edit"

/**
 * Common form dialog props
 */
export interface FormDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: FormDialogMode
  defaultValues?: Partial<T>
  onSuccess?: (data: T) => void
}
