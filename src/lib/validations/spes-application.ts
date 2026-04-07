import { z } from "zod";

// ============================================
// Section Validation Schemas for SPES Application Form
// Aligned with Prisma schema models
// ============================================

// Language item schema (defined first for use in personalDetailsSchema)
export const languageItemSchema = z.object({
  value: z.string().min(1, "Language name is required"),
});

// ProfileUser - Basic Information
export const basicInfoSchema = z.object({
  profileLastName: z.string().min(1, "Last name is required"),
  profileFirstName: z.string().min(1, "First name is required"),
  profileMiddleName: z.string().optional(),
  profileSuffix: z.string().optional(),
  profileRole: z.string().optional(), // Auto-set from auth context, not user input
});

// ProfilePersonal - Personal Details
export const personalDetailsSchema = z.object({
  profileBirthdate: z.string().min(1, "Date of birth is required"),
  profileAge: z.coerce.number().optional(), // Auto-calculated, stays optional
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

// ProfileAddress - Address Information
export const addressSchema = z.object({
  profileHouseStreet: z.string().optional(),
  profileBarangay: z.string().optional(),
  profileMunicipality: z.string().optional(),
  profileProvince: z.string().optional(),
});

// ProfileFamily - Family Information
export const siblingSchema = z.object({
  name: z.string().optional(),
  age: z.coerce.number().optional(),
  sex: z.string().optional(),
});

export const familySchema = z.object({
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherContact: z.string().optional(),
  motherMaidenName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherContact: z.string().optional(),
  numberOfSiblings: z.coerce.number().optional(),
  siblings: z.array(siblingSchema).optional(),
});

// ProfileGuardian - Guardian Information
export const guardianSchema = z.object({
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  guardianAddress: z.string().optional(),
  guardianAge: z.coerce.number().optional(),
  guardianOccupation: z.string().optional(),
  guardianRelationship: z.string().optional(),
});

// ProfileBenefactor - Benefactor Information
export const benefactorSchema = z.object({
  benefactorName: z.string().optional(),
  benefactorRelationship: z.string().optional(),
});

// ProfileEducation - Education Information
export const educationSchema = z.object({
  gradeYear: z.string().optional(),
  schoolName: z.string().optional(),
  trackCourse: z.string().optional(),
  schoolYear: z.string().optional(),
});

// ProfileSkills - Skills Information
export const skillItemSchema = z.object({
  value: z.string().optional(),
});

export const skillsSchema = z.object({
  skills: z.array(skillItemSchema).optional(),
});

// ProfileSPES - SPES-Specific Information
export const spesInfoSchema = z.object({
  isFourPsBeneficiary: z.boolean().optional(),
  applicationYear: z.number().optional(),
  motivation: z.string().optional(),
  remarks: z.string().optional(),
});

// ProfileDocuments - Documents (placeholder, actual upload handled separately)
export const documentsSchema = z.object({
  documents: z.record(z.string(), z.any()).optional(),
});

// Combined SPES Application Schema
export const spesApplicationSchema = z.object({
  ...basicInfoSchema.shape,
  ...personalDetailsSchema.shape,
  ...addressSchema.shape,
  ...familySchema.shape,
  ...guardianSchema.shape,
  ...benefactorSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
  ...spesInfoSchema.shape,
  ...documentsSchema.shape,
});

// ============================================
// Type Exports
// ============================================
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type SiblingFormValues = z.infer<typeof siblingSchema>;
export type FamilyFormValues = z.infer<typeof familySchema>;
export type GuardianFormValues = z.infer<typeof guardianSchema>;
export type BenefactorFormValues = z.infer<typeof benefactorSchema>;
export type EducationFormValues = z.infer<typeof educationSchema>;
export type SkillsFormValues = z.infer<typeof skillsSchema>;
export type SPESInfoFormValues = z.infer<typeof spesInfoSchema>;
export type DocumentsFormValues = z.infer<typeof documentsSchema>;
export type SPESApplicationFormValues = z.infer<typeof spesApplicationSchema>;

// ============================================
// Helper: Get required field keys per section
// Used for validation status checking
// ============================================
export const sectionRequiredFields: Record<string, string[]> = {
  "basic-info": [
    "profileLastName",
    "profileFirstName",
    // profileRole is auto-set from auth context
    "profileBirthdate",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileContact",
    // profileFacebook is now optional
    "profileLanguageDialect",
  ],
  "personal-details": [], // Not used (merged into basic-info)
  address: [], // All optional
  family: [], // All optional
  guardian: [], // All optional
  benefactor: [], // All optional
  education: [], // All optional
  skills: [], // All optional
  "spes-info": [], // All optional
  documents: [], // All optional (placeholder)
  review: [], // No fields, just review
};

// ============================================
// Helper: Validate section fields
// Returns true if all required fields are filled
// ============================================
export function validateSection(
  sectionId: string,
  formValues: Partial<SPESApplicationFormValues>,
): boolean {
  const requiredFields = sectionRequiredFields[sectionId] || [];

  if (requiredFields.length === 0) {
    return true; // No required fields, always valid
  }

  return requiredFields.every((field) => {
    const value = formValues[field as keyof SPESApplicationFormValues];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    // Check for non-empty arrays (e.g., profileLanguageDialect)
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  });
}

// API Request/Response Types
export type SPESApplicationRequest = SPESApplicationFormValues;

export interface SPESApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    profileId: string;
    personalId?: string;
    addressId?: string;
    familyId?: string;
    guardianId?: string;
    benefactorId?: string;
    educationId?: string;
    skillsId?: string;
    spesId?: string;
    documentId?: string;
  };
  error?: string;
}
