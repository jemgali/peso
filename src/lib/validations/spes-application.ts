import { z } from "zod";

// Validation schemas for SPES application form
export const basicInfoSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  profileRole: z.string().min(1, "Role is required"),
});

export const personalDetailsSchema = z.object({
  birthdate: z.string().optional(),
  age: z.coerce.number().optional(),
  placeOfBirth: z.string().optional(),
  sex: z.string().optional(),
  height: z.coerce.number().optional(),
  civilStatus: z.string().optional(),
});

export const contactInfoSchema = z.object({
  languageDialect: z.string().optional(),
  contact: z.string().optional(),
  facebook: z.string().optional(),
});

export const addressSchema = z.object({
  presentAddress: z.string().optional(),
  barangay: z.string().optional(),
  municipality: z.string().optional(),
  province: z.string().optional(),
});

export const educationSchema = z.object({
  educationLevel: z.string().optional(),
  schoolName: z.string().optional(),
  trackCourse: z.string().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
  isGraduated: z.boolean().optional(),
  isCurrentlyEnrolled: z.boolean().optional(),
});

export const spesApplicationSchema = z.object({
  ...basicInfoSchema.shape,
  ...personalDetailsSchema.shape,
  ...contactInfoSchema.shape,
  ...addressSchema.shape,
  ...educationSchema.shape,
});

// Type exports
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
export type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type EducationFormValues = z.infer<typeof educationSchema>;
export type SPESApplicationFormValues = z.infer<typeof spesApplicationSchema>;

// API request/response types
export interface SPESApplicationRequest extends SPESApplicationFormValues {}

export interface SPESApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    profileId: string;
    personalId: string;
  };
  error?: string;
}
