import { z } from "zod";
import {
  formatPhilippineMobileInput,
  PHILIPPINE_MOBILE_REGEX,
} from "@/lib/phone";

// ============================================
// Section Validation Schemas for SPES Application Form
// Aligned with Prisma schema models
// ============================================

// Language item schema (defined first for use in personalDetailsSchema)
export const languageItemSchema = z.object({
  value: z.string().min(1, "Language name is required"),
});

export const applicationTypeSchema = z.enum(["new", "spes-baby"]);

const requiredContactSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? formatPhilippineMobileInput(value) : value,
  z
    .string()
    .trim()
    .min(1, "Contact number is required")
    .regex(PHILIPPINE_MOBILE_REGEX, "Contact number must follow 09xx xxx xxxx"),
);

const optionalContactSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? formatPhilippineMobileInput(value) : value,
  z
    .string()
    .trim()
    .refine((value) => value === "" || PHILIPPINE_MOBILE_REGEX.test(value), {
      message: "Contact number must follow 09xx xxx xxxx",
    })
    .optional(),
);

// ProfileUser - Basic Information
export const basicInfoSchema = z.object({
  profileLastName: z.string().min(1, "Last name is required"),
  profileFirstName: z.string().min(1, "First name is required"),
  profileMiddleName: z.string().optional(),
  profileSuffix: z.string().optional(),
});

// ProfilePersonal - Personal Details
export const personalDetailsSchema = z.object({
  profileBirthdate: z.string().min(1, "Date of birth is required"),
  profileAge: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ), // Auto-calculated, stays optional
  profilePlaceOfBirth: z.string().optional(),
  profileSex: z.string().min(1, "Sex is required"),
  profileHeight: z.coerce.number().min(1, "Height is required"),
  profileCivilStatus: z.string().min(1, "Civil status is required"),
  profileReligion: z.string().min(1, "Religion is required"),
  profileLanguageDialect: z
    .array(languageItemSchema)
    .min(1, "At least one language is required"),
  profileEmail: z.string().email("Valid email is required"),
  profileContact: requiredContactSchema,
  profileFacebook: z.string().url("Please enter a valid Facebook URL"),
  profileDisability: z.string().optional(),
  profilePwdId: z.string().optional(),
});

// ProfileAddress - Address Information (all required)
export const addressSchema = z.object({
  profileHouseStreet: z.string().min(1, "House/Street address is required"),
  profileBarangay: z.string().min(1, "Barangay is required"),
  profileMunicipality: z.string().min(1, "City/Municipality is required"),
  profileProvince: z.string().min(1, "Province is required"),
});

// ProfileFamily - Family Information
export const siblingSchema = z.object({
  name: z.string().min(1, "Sibling name is required"),
  age: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().min(1, "Sibling age is required"),
  ),
  occupation: z.string().optional(),
});

export const familySchema = z.object({
  fatherName: z.string().min(1, "Father's name is required"),
  fatherOccupation: z.string().optional(),
  fatherContact: optionalContactSchema,
  motherMaidenName: z.string().min(1, "Mother's maiden name is required"),
  motherOccupation: z.string().optional(),
  motherContact: optionalContactSchema,
  numberOfSiblings: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  siblings: z.array(siblingSchema).optional(),
});

// ProfileGuardian - Guardian Information (fully optional)
export const guardianSchema = z.object({
  guardianName: z.string().optional(),
  guardianContact: optionalContactSchema,
  guardianAddress: z.string().optional(),
  guardianAge: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
  guardianOccupation: z.string().optional(),
  guardianRelationship: z.string().optional(),
});

// ProfileBenefactor - Benefactor Information
export const benefactorSchema = z.object({
  benefactorName: z.string().optional(),
  benefactorRelationship: z.string().optional(),
});

// ProfileEducation - Education Information (all required)
export const educationSchema = z.object({
  gradeYear: z.string().min(1, "Grade/Year level is required"),
  schoolName: z.string().min(1, "School name is required"),
  trackCourse: z.string().min(1, "Track/Course is required"),
  schoolYear: z.string().min(1, "School year is required"),
});

// ProfileSkills - Skills Information
export const skillItemSchema = z.object({
  value: z.string().optional(),
});

export const skillsSchema = z.object({
  skills: z.array(skillItemSchema).optional(),
});

// ProfileSPES - SPES-Specific Information (motivation required, remarks removed - admin only)
export const spesInfoSchema = z.object({
  isFourPsBeneficiary: z.boolean().optional(),
  // Fix: use z.coerce.number() to handle string from select, or preprocess
  applicationYear: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(2020, "Please select a valid application year").optional(),
  ),
  spesBabiesAvailmentYears: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, "Please provide the number of years").optional(),
  ),
  spesAvailments: z
    .array(
      z.object({
        yearOfAvailment: z.preprocess(
          (val) => (val === "" || val === undefined ? undefined : Number(val)),
          z.number().int().min(1900, "Please provide a valid availment year"),
        ),
        assignedOffice: z
          .string()
          .trim()
          .min(1, "Assigned office is required"),
      }),
    )
    .optional(),
  motivation: z.string().min(1, "Please provide your motivation for applying"),
});

// ProfileDocuments - Documents (placeholder, actual upload handled separately)
export const documentsSchema = z.object({
  documents: z.record(z.string(), z.any()).optional(),
});

// Combined SPES Application Schema
export const spesApplicationSchema = z.object({
  applicationType: applicationTypeSchema.optional(),
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
}).superRefine((values, ctx) => {
  if (values.applicationType === "spes-baby") {
    if (!values.spesAvailments || values.spesAvailments.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["spesAvailments"],
        message:
          "Add at least one availment year and assigned office for SPES Baby applications",
      });
    }
  }
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
    "profileBirthdate",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileContact",
    "profileFacebook",
    "profileLanguageDialect",
  ],
  "personal-details": [], // Not used (merged into basic-info)
  address: [
    "profileHouseStreet",
    "profileBarangay",
    "profileMunicipality",
    "profileProvince",
  ],
  family: ["fatherName", "motherMaidenName"],
  guardian: [],
  benefactor: [], // All optional
  education: ["gradeYear", "schoolName", "trackCourse", "schoolYear"],
  skills: [], // All optional
  "spes-info": ["motivation"],
  documents: [
    "psaCertificate",
    "grades",
    "affidavitLowIncome",
    "barangayCertLowIncome",
    "barangayCertResidency",
    "incomeTaxReturn",
  ],
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
  if (sectionId === "family") {
    const siblings = formValues.siblings || [];
    const hasIncompleteSibling = siblings.some(
      (sibling) =>
        !sibling?.name?.trim() ||
        sibling.age === undefined ||
        sibling.age === null ||
        Number(sibling.age) < 1,
    );
    if (hasIncompleteSibling) return false;
  }

  if (sectionId === "spes-info" && formValues.applicationType === "spes-baby") {
    const availments = formValues.spesAvailments || [];
    if (availments.length === 0) return false;
    const hasIncompleteAvailment = availments.some(
      (availment) =>
        !availment ||
        Number(availment.yearOfAvailment) < 1900 ||
        !availment.assignedOffice?.trim(),
    );
    if (hasIncompleteAvailment) return false;
  }

  const requiredFields = sectionRequiredFields[sectionId] || [];

  if (requiredFields.length === 0) {
    return true; // No required fields, always valid
  }

  if (sectionId === "documents") {
    const docs = formValues.documents || {};
    return requiredFields.every((field) => {
      const value = docs[field];
      return value !== undefined && value !== null;
    });
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
