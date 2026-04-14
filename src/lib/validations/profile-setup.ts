import { z } from "zod";

// Language item schema (reused from spes-application)
export const languageItemSchema = z.object({
  value: z.string().min(1, "Language name is required"),
});

// Profile setup validation schema — same fields as basic-info-section
export const profileSetupSchema = z.object({
  // Name fields (ProfileUser)
  profileLastName: z.string().min(1, "Last name is required"),
  profileFirstName: z.string().min(1, "First name is required"),
  profileMiddleName: z.string().optional(),
  profileSuffix: z.string().optional(),
  // Personal details (ProfilePersonal)
  profileBirthdate: z.string().min(1, "Date of birth is required"),
  profileAge: z.coerce.number().optional(),
  profilePlaceOfBirth: z.string().optional(),
  profileSex: z.string().min(1, "Sex is required"),
  profileHeight: z.coerce.number().min(1, "Height is required"),
  profileCivilStatus: z.string().min(1, "Civil status is required"),
  profileReligion: z.string().min(1, "Religion is required"),
  profileLanguageDialect: z.array(languageItemSchema).min(1, "At least one language is required"),
  profileEmail: z.string().email("Valid email is required"),
  profileContact: z.string().min(1, "Contact number is required"),
  profileFacebook: z.string().url("Please enter a valid Facebook URL").optional().or(z.literal("")),
  profileDisability: z.string().optional(),
  profilePwdId: z.string().optional(),
});

export type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

// API response type
export interface ProfileSetupResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Status response type
export interface ProfileSetupStatusResponse {
  success: boolean;
  isComplete: boolean;
  profileEmail?: string;
}
