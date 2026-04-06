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
    id: "education",
    title: "Education",
    description: "Educational background",
  },
  {
    id: "contact-info",
    title: "Contact Information",
    description: "Communication details",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Verify and submit",
  },
];

const ApplicationForm = () => {
  const [currentStepId, setCurrentStepId] = useState("basic-info");
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({
    "basic-info": "current",
    "personal-details": "incomplete",
    address: "incomplete",
    education: "incomplete",
    "contact-info": "incomplete",
    review: "incomplete",
  });

  const handleStepClick = useCallback((stepId: string) => {
    const section = document.getElementById(stepId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleStepChange = useCallback((stepId: string) => {
    setCurrentStepId(stepId);
    setStepStatuses((prev) => {
      const newStatuses = { ...prev };
      Object.keys(newStatuses).forEach((id) => {
        if (id === stepId) {
          newStatuses[id] = "current";
        } else if (newStatuses[id] === "current") {
          newStatuses[id] = prev[id] === "current" ? "incomplete" : prev[id];
        }
      });
      return newStatuses;
    });
  }, []);

  const handleValidationChange = useCallback(
    (newStatuses: Record<string, StepStatus>) => {
      setStepStatuses((prev) => {
        const merged = { ...prev };
        Object.keys(newStatuses).forEach((key) => {
          if (key === currentStepId) {
            merged[key] = "current";
          } else {
            merged[key] = newStatuses[key];
          }
        });
        return merged;
      });
    },
    [currentStepId]
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
      <div className="w-full lg:w-80 shrink-0 hidden lg:block">
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
          <div className="flex gap-1">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "h-2 w-6 rounded-full transition-all duration-300",
                  stepStatuses[step.id] === "complete" && "bg-green-500",
                  stepStatuses[step.id] === "current" && "bg-primary",
                  stepStatuses[step.id] === "error" && "bg-red-500",
                  stepStatuses[step.id] === "incomplete" && "bg-muted"
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

