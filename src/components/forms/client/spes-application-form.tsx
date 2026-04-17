"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, FieldErrors, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";
import {
  spesApplicationSchema,
  validateSection,
  type SPESApplicationFormValues,
} from "@/lib/validations/spes-application";
import type { StepStatus } from "@/components/client/application-progress";

// Import section components
import {
  BasicInfoSection,
  AddressSection,
  FamilySection,
  GuardianSection,
  BenefactorSection,
  EducationSection,
  SkillsSection,
  SPESInfoSection,
  DocumentsSection,
  ReviewSection,
} from "./sections";

// Section IDs that match the stepper configuration (10 steps total)
const SECTION_IDS = [
  "basic-info",
  "address",
  "family",
  "guardian",
  "benefactor",
  "education",
  "skills",
  "spes-info",
  "documents",
  "review",
] as const;

// Section titles for display
const SECTION_TITLES: Record<string, string> = {
  "basic-info": "Personal Information",
  address: "Address",
  family: "Family Information",
  guardian: "Guardian Details",
  benefactor: "Benefactor Information",
  education: "Educational Background",
  skills: "Skills",
  "spes-info": "SPES Program Details",
  documents: "Documents",
  review: "Review & Submit",
};

// Section field mappings for validation
const SECTION_FIELDS: Record<string, (keyof SPESApplicationFormValues)[]> = {
  "basic-info": [
    "profileLastName",
    "profileFirstName",
    "profileBirthdate",
    "profileAge",
    "profilePlaceOfBirth",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileContact",
    "profileFacebook",
    "profileLanguageDialect",
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
  ],
  documents: ["documents"],
  review: [],
};

const TOUCHED_FIELDS: Record<string, string[]> = {
  "basic-info": [
    "profileLastName",
    "profileFirstName",
    "profileBirthdate",
    "profileAge",
    "profilePlaceOfBirth",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileContact",
    "profileFacebook",
    "profileLanguageDialect",
  ],
  address: [
    "profileHouseStreet",
    "profileBarangay",
    "profileMunicipality",
    "profileProvince",
  ],
  family: ["fatherName", "motherMaidenName"],
  guardian: [],
  benefactor: ["benefactorName"],
  education: ["gradeYear", "schoolName", "trackCourse", "schoolYear"],
  skills: ["skills"],
  "spes-info": ["applicationYear", "motivation"],
  documents: ["documents"],
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
    if (Array.isArray(value)) {
      return value.some((v) => v === true);
    }
    return value === true;
  });
}

function checkSectionHasData(
  sectionId: string,
  values: SPESApplicationFormValues,
): boolean {
  const fields = SECTION_FIELDS[sectionId] || [];
  return fields.some((field) => {
    const value = values[field];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  });
}

export interface SPESApplicationFormProps {
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  onValidationChange?: (stepStatuses: Record<string, StepStatus>) => void;
  onMount?: (goToStep: (stepIndex: number) => Promise<void>) => void;
  userEmail?: string;
  defaultValues?: Record<string, unknown>;
  applicationType?: "new" | "spes-baby";
  revisionFeedback?: Record<string, any>;
}

const SPESApplicationForm: React.FC<SPESApplicationFormProps> = ({
  currentStep: controlledStep,
  onStepChange,
  onValidationChange,
  onMount,
  userEmail,
  defaultValues: externalDefaults,
  applicationType,
  revisionFeedback,
}) => {
  const router = useRouter();
  const [internalStep, setInternalStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  // Use controlled step if provided, otherwise use internal state
  const currentStep = controlledStep ?? internalStep;

  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    setValue,
    getValues,
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
      // Documents (placeholder)
      documents: {},
      // Merge in pre-populated values from onboarding
      ...(externalDefaults as Partial<SPESApplicationFormValues>),
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setVisitedSteps((prev) => {
      if (prev.has(currentStep)) return prev;
      return new Set(prev).add(currentStep);
    });
  }, [currentStep]);

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

    SECTION_IDS.forEach((sectionId, index) => {
      const sectionHasErrors = checkSectionErrors(sectionId, errors);
      const sectionIsValid = validateSection(sectionId, getValues());
      const isOptional = ["skills", "benefactor", "guardian"].includes(sectionId);
      const sectionTouched = checkSectionTouched(sectionId, touchedFields);
      const sectionHasData = checkSectionHasData(sectionId, getValues());

      if (sectionHasErrors) {
        statuses[sectionId] = "error";
      } else if (
        sectionIsValid &&
        (sectionTouched || sectionHasData || (isOptional && visitedSteps.has(index)))
      ) {
        statuses[sectionId] = "complete";
      } else if (index === currentStep) {
        statuses[sectionId] = "current";
      } else {
        statuses[sectionId] = "incomplete";
      }
    });

    statuses["review"] = isValid ? "complete" : "incomplete";

    return statuses;
  }, [errors, getValues, touchedFields, isValid, currentStep]);

  // Update validation statuses when form state changes
  useEffect(() => {
    const statuses = getStepStatuses();
    onValidationChange?.(statuses);
  }, [getStepStatuses, onValidationChange]);

  // Notify parent of step change
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Navigate to specific step (from sidebar)
  const validateStepBeforeAdvance = useCallback(
    async (sectionId: (typeof SECTION_IDS)[number]) => {
      const fieldsToValidate = SECTION_FIELDS[sectionId];
      const isFieldValid = await trigger(fieldsToValidate);

      if (!isFieldValid) return false;

      if (sectionId === "documents") {
        return validateSection("documents", getValues());
      }

      return true;
    },
    [getValues, trigger],
  );

  // Navigate to specific step (from sidebar)
  const goToStep = useCallback(
    async (stepIndex: number) => {
      // Allow going back to any previous step
      if (stepIndex < currentStep) {
        if (controlledStep === undefined) {
          setInternalStep(stepIndex);
        }
        onStepChange?.(stepIndex);
        return;
      }

      // For forward navigation, validate all steps up to and including the target
      for (let i = currentStep; i < stepIndex; i++) {
        const sectionId = SECTION_IDS[i];
        const isStepValid = await validateStepBeforeAdvance(sectionId);

        if (!isStepValid) {
          if (sectionId === "documents") {
            toast.error("Please upload all required documents before proceeding.");
          } else {
            toast.error(
              `Please complete the "${SECTION_TITLES[sectionId]}" section first.`,
            );
          }
          if (controlledStep === undefined) {
            setInternalStep(i);
          }
          onStepChange?.(i);
          return;
        }
      }

      // All steps validated, go to target
      if (controlledStep === undefined) {
        setInternalStep(stepIndex);
      }
      onStepChange?.(stepIndex);
    },
    [currentStep, controlledStep, onStepChange, validateStepBeforeAdvance],
  );

  // Expose goToStep function to parent via onMount callback
  useEffect(() => {
    onMount?.(goToStep);
  }, [goToStep, onMount]);

  // Navigate to next step with validation
  const handleNext = async () => {
    const sectionId = SECTION_IDS[currentStep];

    setIsValidating(true);

    const isStepValid = await validateStepBeforeAdvance(sectionId);

    setIsValidating(false);

    if (isStepValid) {
      if (currentStep < SECTION_IDS.length - 1) {
        const newStep = currentStep + 1;
        if (controlledStep === undefined) {
          setInternalStep(newStep);
        }
        onStepChange?.(newStep);
      }
    } else {
      if (sectionId === "documents") {
        toast.error("Please upload all required documents before proceeding.");
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      if (controlledStep === undefined) {
        setInternalStep(newStep);
      }
      onStepChange?.(newStep);
    }
  };

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
      // Redirect to dashboard after successful submission
      router.push("/protected/client");
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

  // Common props for most sections
  const sectionProps = {
    register,
    errors,
    isPending,
    watch,
    setValue,
    formValues: getValues(),
    applicationType,
    revisionFeedback,
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

  // Render only the current section (10 steps total)
  const renderCurrentSection = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoSection {...sectionWithFieldArrayProps} userEmail={userEmail} />;
      case 1:
        return <AddressSection {...sectionProps} />;
      case 2:
        return <FamilySection {...sectionWithFieldArrayProps} />;
      case 3:
        return <GuardianSection {...sectionProps} />;
      case 4:
        return <BenefactorSection {...sectionProps} />;
      case 5:
        return <EducationSection {...sectionProps} />;
      case 6:
        return <SkillsSection {...sectionWithFieldArrayProps} />;
      case 7:
        return <SPESInfoSection {...sectionWithControlProps} />;
      case 8:
        return <DocumentsSection {...sectionProps} />;
      case 9: {
        const statuses = getStepStatuses();
        const incompleteSections = SECTION_IDS.filter(
          (id) => id !== "review" && statuses[id] !== "complete"
        ).map((id) => SECTION_TITLES[id]);

        return (
          <ReviewSection
            formValues={getValues()}
            isPending={isPending}
            isValid={isValid}
            errors={errors}
            incompleteSections={incompleteSections}
            triggerValidation={trigger as () => Promise<boolean>}
            onSubmitRequest={handleSubmitRequest}
          />
        );
      }
      default:
        return null;
    }
  };

  const isLastStep = currentStep === SECTION_IDS.length - 1;
  const isFirstStep = currentStep === 0;

  const currentSectionId = SECTION_IDS[currentStep];
  const currentSectionFields = SECTION_FIELDS[currentSectionId] || [];
  
  const currentSectionFeedback = useMemo(() => {
    if (!revisionFeedback) return [];
    return Object.entries(revisionFeedback).filter(([field]) => 
      currentSectionFields.includes(field as any) || field === currentSectionId
    );
  }, [revisionFeedback, currentSectionId, currentSectionFields]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Current Section Content */}
      <div className="min-h-100">
        {currentSectionFeedback.length > 0 && currentStep !== SECTION_IDS.length - 1 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
              ⚠️ Admin Feedback (Needs Revision)
            </h3>
            <ul className="text-sm text-red-700 dark:text-red-300 list-disc pl-5 space-y-1">
              {currentSectionFeedback.map(([field, comment]: [string, any]) => {
                const formattedName = field
                  .replace(/^profile/, "")
                  .replace(/([A-Z])/g, " $1")
                  .trim();
                return (
                  <li key={field}>
                    <strong>{formattedName ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1) : field}: </strong> {comment}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {renderCurrentSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {SECTION_IDS.length}
        </span>

        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isPending || isValidating}
          >
            {isValidating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Validating...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </form>
  );
};

export { SECTION_IDS, SECTION_TITLES };
export default SPESApplicationForm;
