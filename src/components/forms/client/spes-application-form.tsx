"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray, FieldErrors, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  spesApplicationSchema,
  validateSection,
  type SPESApplicationFormValues,
} from "@/lib/validations/spes-application";
import type { StepStatus } from "@/components/client/application-progress";

// Import section components
import {
  BasicInfoSection,
  PersonalDetailsSection,
  AddressSection,
  FamilySection,
  GuardianSection,
  BenefactorSection,
  EducationSection,
  SkillsSection,
  SPESInfoSection,
  DocumentsSection,
  ContactSection,
  ReviewSection,
} from "./sections";

// Section IDs that match the stepper configuration
const SECTION_IDS = [
  "basic-info",
  "personal-details",
  "address",
  "family",
  "guardian",
  "benefactor",
  "education",
  "skills",
  "spes-info",
  "documents",
  "contact-info",
  "review",
] as const;

// Section field mappings
const SECTION_FIELDS: Record<string, string[]> = {
  "basic-info": ["profileLastName", "profileFirstName", "profileRole"],
  "personal-details": [
    "profileBirthdate",
    "profileAge",
    "profilePlaceOfBirth",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileDisability",
    "profilePwdId",
  ],
  address: [
    "profileHouseStreet",
    "profileBarangay",
    "profileMunicipality",
    "profileProvince",
  ],
  family: [
    "fatherName",
    "fatherOccupation",
    "fatherContact",
    "motherMaidenName",
    "motherOccupation",
    "motherContact",
    "numberOfSiblings",
  ],
  guardian: [
    "guardianName",
    "guardianContact",
    "guardianAddress",
    "guardianAge",
    "guardianOccupation",
    "guardianRelationship",
  ],
  benefactor: ["benefactorName", "benefactorRelationship"],
  education: ["gradeYear", "schoolName", "trackCourse", "schoolYear"],
  skills: ["skills"],
  "spes-info": [
    "isFourPsBeneficiary",
    "applicationYear",
    "motivation",
    "remarks",
  ],
  documents: ["documents"],
  "contact-info": ["profileContact", "profileFacebook"],
  review: [],
};

const TOUCHED_FIELDS: Record<string, string[]> = {
  "basic-info": ["profileLastName", "profileFirstName", "profileRole"],
  "personal-details": [
    "profileBirthdate",
    "profileAge",
    "profilePlaceOfBirth",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
  ],
  address: [
    "profileHouseStreet",
    "profileBarangay",
    "profileMunicipality",
    "profileProvince",
  ],
  family: ["fatherName", "motherMaidenName"],
  guardian: ["guardianName"],
  benefactor: ["benefactorName"],
  education: ["gradeYear", "schoolName"],
  skills: ["skills"],
  "spes-info": ["applicationYear", "motivation"],
  documents: [],
  "contact-info": ["profileContact", "profileFacebook"],
  review: [],
};

// Check if a section has errors
function checkSectionErrors(
  sectionId: string,
  errors: FieldErrors<SPESApplicationFormValues>,
): boolean {
  const fields = SECTION_FIELDS[sectionId] || [];
  return fields.some(
    (field) => (errors as Record<string, unknown>)[field] !== undefined,
  );
}

// Check if user has touched any field in a section
function checkSectionTouched(
  sectionId: string,
  touched: Record<string, unknown>,
): boolean {
  const fields = TOUCHED_FIELDS[sectionId] || [];
  return fields.some((field) => {
    const value = touched[field];
    // Handle both single boolean and array of booleans (for array fields)
    if (Array.isArray(value)) {
      return value.some((v) => v === true);
    }
    return value === true;
  });
}

export interface SPESApplicationFormProps {
  onStepChange?: (stepId: string) => void;
  onValidationChange?: (stepStatuses: Record<string, StepStatus>) => void;
}

const SPESApplicationForm: React.FC<SPESApplicationFormProps> = ({
  onStepChange,
  onValidationChange,
}) => {
  const [isPending, setIsPending] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid, touchedFields },
  } = useForm<SPESApplicationFormValues>({
    resolver: zodResolver(
      spesApplicationSchema,
    ) as Resolver<SPESApplicationFormValues>,
    defaultValues: {
      // Basic Info
      profileLastName: "",
      profileFirstName: "",
      profileMiddleName: "",
      profileSuffix: "",
      profileRole: "",
      // Personal Details
      profileBirthdate: "",
      profileAge: undefined,
      profilePlaceOfBirth: "",
      profileSex: "",
      profileHeight: undefined,
      profileCivilStatus: "",
      profileReligion: "",
      profileLanguageDialect: [],
      profileEmail: "",
      profileContact: "",
      profileFacebook: "",
      profileDisability: "",
      profilePwdId: "",
      // Address
      profileHouseStreet: "",
      profileBarangay: "",
      profileMunicipality: "",
      profileProvince: "",
      // Family
      fatherName: "",
      fatherOccupation: "",
      fatherContact: "",
      motherMaidenName: "",
      motherOccupation: "",
      motherContact: "",
      numberOfSiblings: undefined,
      siblings: [],
      // Guardian
      guardianName: "",
      guardianContact: "",
      guardianAddress: "",
      guardianAge: undefined,
      guardianOccupation: "",
      guardianRelationship: "",
      // Benefactor
      benefactorName: "",
      benefactorRelationship: "",
      // Education
      gradeYear: "",
      schoolName: "",
      trackCourse: "",
      schoolYear: "",
      // Skills
      skills: [],
      // SPES Info
      isFourPsBeneficiary: false,
      applicationYear: undefined,
      motivation: "",
      remarks: "",
      // Documents (placeholder)
      documents: {},
    },
    mode: "onChange",
  });

  const formValues = watch();

  // Field arrays for dynamic fields
  const siblingsFieldArray = useFieldArray({
    control,
    name: "siblings",
  });

  const skillsFieldArray = useFieldArray({
    control,
    name: "skills",
  });

  const languageFieldArray = useFieldArray({
    control,
    name: "profileLanguageDialect",
  });

  // Update validation statuses based on form state
  const getStepStatuses = useCallback((): Record<string, StepStatus> => {
    const statuses: Record<string, StepStatus> = {};

    SECTION_IDS.forEach((sectionId) => {
      // Check if section has validation errors
      const sectionHasErrors = checkSectionErrors(sectionId, errors);

      // Check if section is valid (required fields filled)
      const sectionIsValid = validateSection(sectionId, formValues);

      // Check if user has interacted with this section
      const sectionTouched = checkSectionTouched(sectionId, touchedFields);

      if (sectionHasErrors) {
        statuses[sectionId] = "error";
      } else if (sectionIsValid && sectionTouched) {
        statuses[sectionId] = "complete";
      } else {
        statuses[sectionId] = "incomplete";
      }
    });

    // Review section is valid only when form is fully valid
    statuses["review"] = isValid ? "complete" : "incomplete";

    return statuses;
  }, [errors, formValues, touchedFields, isValid]);

  // Set up Intersection Observer to track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              onStepChange?.(sectionId);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [onStepChange]);

  // Update validation statuses when form state changes
  useEffect(() => {
    const statuses = getStepStatuses();
    onValidationChange?.(statuses);
  }, [getStepStatuses, onValidationChange]);

  const onSubmit = async (data: SPESApplicationFormValues) => {
    setIsPending(true);
    try {
      const response = await fetch("/api/client/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application",
      );
    } finally {
      setIsPending(false);
    }
  };

  // Handle submit request from review section
  const handleSubmitRequest = () => {
    handleSubmit(onSubmit)();
  };

  // Helper to set section refs
  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  // Common props for most sections
  const sectionProps = {
    register,
    errors,
    isPending,
    setSectionRef,
  };

  // Props for sections with control
  const sectionWithControlProps = {
    ...sectionProps,
    control,
  };

  // Props for sections with field arrays
  const sectionWithFieldArrayProps = {
    ...sectionWithControlProps,
    siblingsFieldArray,
    skillsFieldArray,
    languageFieldArray,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12">
      <BasicInfoSection {...sectionProps} />

      <hr className="border-border" />

      <PersonalDetailsSection {...sectionWithFieldArrayProps} />

      <hr className="border-border" />

      <AddressSection {...sectionProps} />

      <hr className="border-border" />

      <FamilySection {...sectionWithFieldArrayProps} />

      <hr className="border-border" />

      <GuardianSection {...sectionProps} />

      <hr className="border-border" />

      <BenefactorSection {...sectionProps} />

      <hr className="border-border" />

      <EducationSection {...sectionProps} />

      <hr className="border-border" />

      <SkillsSection {...sectionWithFieldArrayProps} />

      <hr className="border-border" />

      <SPESInfoSection {...sectionWithControlProps} />

      <hr className="border-border" />

      <DocumentsSection {...sectionProps} />

      <hr className="border-border" />

      <ContactSection {...sectionProps} />

      <hr className="border-border" />

      <ReviewSection
        formValues={formValues}
        isPending={isPending}
        isValid={isValid}
        setSectionRef={setSectionRef}
        onSubmitRequest={handleSubmitRequest}
      />
    </form>
  );
};

export default SPESApplicationForm;
