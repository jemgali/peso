"use client";

import React, { useState, useCallback, useMemo } from "react";
import SPESApplicationForm, {
  type SectionId,
} from "@/components/forms/client/spes-application-form";
import ApplicationProgress, {
  type StepStatus,
} from "@/components/client/application-progress";
import { Card } from "@/ui/card";
import { cn } from "@/lib/utils";
import {
  FORM_SECTION_TITLES,
  getVisibleFormSections,
} from "@/lib/utils/revision-targets";
import type { RevisionTargets } from "@/lib/validations/application-review";

import TypeSelection, { type ApplicationType } from "@/components/client/content/type-selection";

const createInitialStepStatuses = (
  sectionIds: readonly string[],
): Record<string, StepStatus> =>
  sectionIds.reduce(
    (acc, id) => {
    acc[id] = "incomplete";
    return acc;
  },
  {} as Record<string, StepStatus>
);

interface ApplicationFormProps {
  userEmail?: string;
  userId?: string;
  defaultValues?: Record<string, unknown>;
  revisionTargets?: RevisionTargets;
  initialApplicationType?: ApplicationType;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  userEmail,
  userId,
  defaultValues,
  revisionTargets,
  initialApplicationType,
}) => {
  const visibleSectionIds = useMemo(
    () => getVisibleFormSections(revisionTargets),
    [revisionTargets],
  );

  const steps = useMemo(
    () =>
      visibleSectionIds.map((id) => ({
        id,
        title: FORM_SECTION_TITLES[id],
        description: "",
      })),
    [visibleSectionIds],
  );
  const [applicationType, setApplicationType] = useState<ApplicationType | null>(
    initialApplicationType || null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] =
    useState<Record<string, StepStatus>>(createInitialStepStatuses(visibleSectionIds));
  const [goToStepFn, setGoToStepFn] = useState<
    ((stepIndex: number) => Promise<void>) | null
  >(null);

  const handleStepChange = useCallback(
    (stepIndex: number) => {
      setCurrentStep(stepIndex);
    },
    []
  );

  const handleValidationChange = useCallback(
    (newStatuses: Record<string, StepStatus>) => {
      setStepStatuses(newStatuses);
    },
    []
  );

  const handleStepClick = useCallback(
    async (stepId: string) => {
      const stepIndex = visibleSectionIds.indexOf(stepId as SectionId);
      if (stepIndex !== -1 && goToStepFn) {
        await goToStepFn(stepIndex);
      }
    },
    [goToStepFn, visibleSectionIds]
  );

  // Expose goToStep function from form to container
  const handleFormMount = useCallback(
    (goToStep: (stepIndex: number) => Promise<void>) => {
      setGoToStepFn(() => goToStep);
    },
    []
  );

  if (!applicationType) {
    return <TypeSelection onSelect={setApplicationType} />;
  }

  const safeCurrentStep = Math.min(currentStep, Math.max(steps.length - 1, 0));
  const currentStepId = visibleSectionIds[safeCurrentStep];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Form Content */}
      <div className="flex-1 min-w-0 w-full lg:pb-20">
        <Card className="p-4 sm:p-6">
          <SPESApplicationForm
            currentStep={safeCurrentStep}
            onStepChange={handleStepChange}
            onValidationChange={handleValidationChange}
            onMount={handleFormMount}
            userEmail={userEmail}
            userId={userId}
            defaultValues={defaultValues}
            applicationType={applicationType}
            revisionTargets={revisionTargets}
            visibleSectionIds={visibleSectionIds}
          />
        </Card>
      </div>

      {/* Progress Sidebar - Right Side (Desktop only) */}
      <div className="w-full lg:w-72 shrink-0 hidden lg:block">
          <ApplicationProgress
            currentStep={safeCurrentStep}
            currentStepId={currentStepId}
            stepStatuses={stepStatuses}
            onStepClick={handleStepClick}
            steps={steps}
          />
        </div>

      {/* Mobile Progress Bar - Bottom (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Step {safeCurrentStep + 1} of {steps.length}
            </p>
            <p className="text-sm font-medium">
              {steps[safeCurrentStep]?.title}
            </p>
          </div>
          <div className="flex gap-0.5">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                    className={cn(
                      "h-2 w-4 rounded-full transition-all duration-300",
                      index === safeCurrentStep && "bg-primary",
                      index !== safeCurrentStep &&
                        stepStatuses[step.id] === "complete" &&
                      "bg-green-500",
                      index !== safeCurrentStep &&
                        stepStatuses[step.id] === "error" &&
                      "bg-red-500",
                      index !== safeCurrentStep &&
                        stepStatuses[step.id] === "revision" &&
                      "bg-orange-500 animate-pulse",
                      index !== safeCurrentStep &&
                        stepStatuses[step.id] === "incomplete" &&
                      "bg-muted"
                    )}
                aria-label={`Go to ${step.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
