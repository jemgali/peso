"use client";

import React, { useState, useCallback } from "react";
import SPESApplicationForm, {
  SECTION_IDS,
  SECTION_TITLES,
} from "@/components/forms/client/spes-application-form";
import ApplicationProgress, {
  type StepStatus,
} from "@/components/client/application-progress";
import { Card } from "@/ui/card";
import { cn } from "@/lib/utils";

const steps = SECTION_IDS.map((id) => ({
  id,
  title: SECTION_TITLES[id],
  description: "",
}));

// Initialize all step statuses as incomplete
const initialStepStatuses: Record<string, StepStatus> = SECTION_IDS.reduce(
  (acc, id) => {
    acc[id] = "incomplete";
    return acc;
  },
  {} as Record<string, StepStatus>
);

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] =
    useState<Record<string, StepStatus>>(initialStepStatuses);
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
      const stepIndex = SECTION_IDS.indexOf(
        stepId as (typeof SECTION_IDS)[number]
      );
      if (stepIndex !== -1 && goToStepFn) {
        await goToStepFn(stepIndex);
      }
    },
    [goToStepFn]
  );

  // Expose goToStep function from form to container
  const handleFormMount = useCallback(
    (goToStep: (stepIndex: number) => Promise<void>) => {
      setGoToStepFn(() => goToStep);
    },
    []
  );

  const currentStepId = SECTION_IDS[currentStep];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Form Content */}
      <div className="flex-1 min-w-0 w-full lg:pb-20">
        <Card className="p-4 sm:p-6">
          <SPESApplicationForm
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onValidationChange={handleValidationChange}
            onMount={handleFormMount}
          />
        </Card>
      </div>

      {/* Progress Sidebar - Right Side (Desktop only) */}
      <div className="w-full lg:w-72 shrink-0 hidden lg:block">
        <ApplicationProgress
          currentStep={currentStep}
          currentStepId={currentStepId}
          stepStatuses={stepStatuses}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Mobile Progress Bar - Bottom (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-sm font-medium">
              {steps[currentStep]?.title}
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
                  index === currentStep && "bg-primary",
                  index !== currentStep &&
                    stepStatuses[step.id] === "complete" &&
                    "bg-green-500",
                  index !== currentStep &&
                    stepStatuses[step.id] === "error" &&
                    "bg-red-500",
                  index !== currentStep &&
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
