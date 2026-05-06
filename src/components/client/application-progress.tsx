"use client";

import React from "react";
import { Card } from "@/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Progress } from "@/ui/progress";
import { cn } from "@/lib/utils";

export type StepStatus = "incomplete" | "complete" | "error" | "current" | "revision";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
}

const DEFAULT_STEPS: ProgressStep[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Name and personal details",
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
    id: "review",
    title: "Review & Submit",
    description: "Verify and submit",
  },
];

interface ApplicationProgressProps {
  currentStep?: number;
  currentStepId?: string;
  stepStatuses?: Record<string, StepStatus>;
  onStepClick?: (stepId: string) => void;
  steps?: ProgressStep[];
}

const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  currentStep = 0,
  currentStepId,
  stepStatuses = {},
  onStepClick,
  steps = DEFAULT_STEPS,
}) => {
  const progressSteps = steps.length > 0 ? steps : DEFAULT_STEPS;
  // Use currentStepId if provided, otherwise derive from currentStep
  const activeStepId = currentStepId ?? progressSteps[currentStep]?.id ?? "basic-info";
  const progressPercentage =
    progressSteps.length > 1
      ? (currentStep / (progressSteps.length - 1)) * 100
      : 100;

  const getStepStatus = (stepId: string): StepStatus => {
    if (stepId === activeStepId) return "current";
    // Return the actual status from stepStatuses, defaulting to incomplete
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
      case "revision":
        return (
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-pulse" />
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
        return "bg-green-50 dark:bg-green-950/20";
      case "error":
        return "bg-red-50 dark:bg-red-950/20";
      case "revision":
        return "bg-orange-50 dark:bg-orange-950/20 ring-1 ring-orange-200 dark:ring-orange-800";
      case "current":
        return "bg-blue-50 dark:bg-blue-950/20";
      case "incomplete":
      default:
        return "bg-muted";
    }
  };

  // Determine if a step is clickable (can go back or forward with validation)
  const isStepClickable = (index: number): boolean => {
    // Can always go back or click current step
    if (index <= currentStep) return true;
    // For forward navigation, allow clicking but the form will validate
    return true;
  };

  return (
    <Card className="p-4 fixed max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Application Progress</h3>
          <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep + 1} of {progressSteps.length}
          </p>
        </div>

        <div className="space-y-1">
          {progressSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const clickable = isStepClickable(index);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!clickable}
                className={cn(
                  "flex items-start gap-2.5 p-2.5 rounded-lg transition-colors w-full text-left",
                  getStepBackground(step.id),
                  clickable && onStepClick && "hover:opacity-80 cursor-pointer",
                  !clickable && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getStepIcon(step.id, index)}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      status === "current" || status === "complete"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
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
