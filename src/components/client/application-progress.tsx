"use client";

import React from "react";
import { Card } from "@/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Progress } from "@/ui/progress";
import { cn } from "@/lib/utils";

export type StepStatus = "incomplete" | "complete" | "error" | "current";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
}

const steps: ProgressStep[] = [
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

interface ApplicationProgressProps {
  currentStepId?: string;
  stepStatuses?: Record<string, StepStatus>;
  onStepClick?: (stepId: string) => void;
}

const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  currentStepId = "basic-info",
  stepStatuses = {},
  onStepClick,
}) => {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

  const getStepStatus = (stepId: string): StepStatus => {
    if (stepId === currentStepId) return "current";
    return stepStatuses[stepId] || "incomplete";
  };

  const getStepIcon = (stepId: string, index: number) => {
    const status = getStepStatus(stepId);

    switch (status) {
      case "complete":
        return (
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      case "error":
        return (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        );
      case "current":
        return (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs text-primary-foreground font-medium">
              {index + 1}
            </span>
          </div>
        );
      case "incomplete":
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStepBackground = (stepId: string): string => {
    const status = getStepStatus(stepId);

    switch (status) {
      case "complete":
        return "bg-green-50 dark:bg-green-950";
      case "error":
        return "bg-red-50 dark:bg-red-950";
      case "current":
        return "bg-blue-50 dark:bg-blue-950";
      case "incomplete":
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="p-4 fixed">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Application Progress</h3>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors w-full text-left",
                  getStepBackground(step.id),
                  onStepClick && "hover:opacity-80 cursor-pointer",
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getStepIcon(step.id, index)}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      status === "current" || status === "complete"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ApplicationProgress;
