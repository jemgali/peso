// Form section components for SPES application
export { default as BasicInfoSection } from "./basic-info-section";
export { default as AddressSection } from "./address-section";
export { default as FamilySection } from "./family-section";
export { default as GuardianSection } from "./guardian-section";
export { default as BenefactorSection } from "./benefactor-section";
export { default as EducationSection } from "./education-section";
export { default as SkillsSection } from "./skills-section";
export { default as SPESInfoSection } from "./spes-info-section";
export { default as DocumentsSection } from "./documents-section";
export { default as ReviewSection } from "./review-section";

// Type exports
export type {
  FormSectionProps,
  FormSectionWithControlProps,
  FormSectionWithFieldArrayProps,
  ReviewSectionProps,
  SPESApplicationFormValues,
} from "./types";
