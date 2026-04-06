"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  spesApplicationSchema,
  type SPESApplicationFormValues,
} from "@/lib/validations/spes-application";
import type { StepStatus } from "@/components/client/application-progress";

// Import section components
import {
  BasicInfoSection,
  PersonalDetailsSection,
  AddressSection,
  EducationSection,
  ContactSection,
  ReviewSection,
} from "./sections";

// Section IDs that match the stepper configuration
const SECTION_IDS = [
  "basic-info",
  "personal-details",
  "address",
  "education",
  "contact-info",
  "review",
] as const;

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
    formState: { errors, isValid },
  } = useForm<SPESApplicationFormValues>({
    resolver: zodResolver(spesApplicationSchema) as any,
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      profileRole: "",
      birthdate: "",
      age: undefined,
      placeOfBirth: "",
      sex: "",
      height: undefined,
      civilStatus: "",
      presentAddress: "",
      barangay: "",
      municipality: "",
      province: "",
      educationLevel: "",
      schoolName: "",
      trackCourse: "",
      startYear: undefined,
      endYear: undefined,
      isGraduated: false,
      isCurrentlyEnrolled: false,
      languageDialect: "",
      contact: "",
      facebook: "",
    },
    mode: "onChange",
  });

  const formValues = watch();

  // Update validation statuses based on form state
  const getStepStatuses = useCallback((): Record<string, StepStatus> => {
    const hasBasicInfoErrors = !!(
      errors.lastName ||
      errors.firstName ||
      errors.profileRole
    );
    const hasBasicInfoFilled =
      formValues.lastName && formValues.firstName && formValues.profileRole;

    return {
      "basic-info": hasBasicInfoErrors
        ? "error"
        : hasBasicInfoFilled
          ? "complete"
          : "incomplete",
      "personal-details": "complete",
      address: "complete",
      education: "complete",
      "contact-info": "complete",
      review: isValid ? "complete" : "incomplete",
    };
  }, [errors, formValues, isValid]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12">
      <BasicInfoSection {...sectionProps} />

      <hr className="border-border" />

      <PersonalDetailsSection {...sectionProps} />

      <hr className="border-border" />

      <AddressSection {...sectionProps} />

      <hr className="border-border" />

      <EducationSection {...sectionProps} control={control} />

      <hr className="border-border" />

      <ContactSection {...sectionProps} />

      <hr className="border-border" />

      <ReviewSection
        formValues={formValues}
        isPending={isPending}
        isValid={isValid}
        setSectionRef={setSectionRef}
      />
    </form>
  );
};

export default SPESApplicationForm;
