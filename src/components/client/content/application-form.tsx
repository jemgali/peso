"use client";

import React, { useState, useCallback } from "react";
import SPESApplicationForm from "@/components/forms/client/spes-application-form";
import ApplicationProgress, {
  type StepStatus,
} from "@/components/client/application-progress";
import { Card } from "@/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Name and role",
  },
  {
    id: "personal-details",
    title: "Personal Details",
    description: "Birthdate and demographics",
  },
  {
    id: "address",
    title: "Address",
    description: "Current residence",
  },
  {
    id: "family",
    title: "Family",
    description: "Parents and siblings",
  },
  {
    id: "guardian",
    title: "Guardian",
    description: "Guardian details",
  },
  {
    id: "benefactor",
    title: "Benefactor",
    description: "Supporting person",
  },
  {
    id: "education",
    title: "Education",
    description: "Educational background",
  },
  {
    id: "skills",
    title: "Skills",
    description: "Your competencies",
  },
  {
    id: "spes-info",
    title: "SPES Details",
    description: "Program information",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Required papers",
  },
  {
    id: "contact-info",
    title: "Contact",
    description: "Communication details",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Verify and submit",
  },
];

// Initialize all step statuses as incomplete
const initialStepStatuses: Record<string, StepStatus> = steps.reduce(
  (acc, step) => {
    acc[step.id] = "incomplete";
    return acc;
  },
  {} as Record<string, StepStatus>
);

const ApplicationForm = () => {
  const [currentStepId, setCurrentStepId] = useState("basic-info");
  const [stepStatuses, setStepStatuses] =
    useState<Record<string, StepStatus>>(initialStepStatuses);

  const handleStepClick = useCallback((stepId: string) => {
    const section = document.getElementById(stepId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleStepChange = useCallback((stepId: string) => {
    setCurrentStepId(stepId);
  }, []);

  const handleValidationChange = useCallback(
    (newStatuses: Record<string, StepStatus>) => {
      setStepStatuses(newStatuses);
    },
    []
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Form Content */}
      <div className="flex-1 min-w-0 w-full lg:pb-20">
        <Card className="p-4 sm:p-6">
          <SPESApplicationForm
            onStepChange={handleStepChange}
            onValidationChange={handleValidationChange}
          />
        </Card>
      </div>

      {/* Progress Sidebar - Right Side (Desktop only) */}
      <div className="w-full lg:w-72 shrink-0 hidden lg:block">
        <ApplicationProgress
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
              Step {steps.findIndex((s) => s.id === currentStepId) + 1} of{" "}
              {steps.length}
            </p>
            <p className="text-sm font-medium">
              {steps.find((s) => s.id === currentStepId)?.title}
            </p>
          </div>
          <div className="flex gap-0.5">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "h-2 w-4 rounded-full transition-all duration-300",
                  step.id === currentStepId && "bg-primary",
                  step.id !== currentStepId &&
                    stepStatuses[step.id] === "complete" &&
                    "bg-green-500",
                  step.id !== currentStepId &&
                    stepStatuses[step.id] === "error" &&
                    "bg-red-500",
                  step.id !== currentStepId &&
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
