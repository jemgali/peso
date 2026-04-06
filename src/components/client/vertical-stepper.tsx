"use client";

import React from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepConfig {
  id: string;
  title: string;
  description: string;
}

export type StepStatus = "incomplete" | "complete" | "error" | "current";

interface VerticalStepperProps {
  steps: StepConfig[];
  currentStepId: string;
  stepStatuses: Record<string, StepStatus>;
  onStepClick: (stepId: string) => void;
  className?: string;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  currentStepId,
  stepStatuses,
  onStepClick,
  className,
}) => {
  const getStepIcon = (stepId: string, index: number) => {
    const status = stepStatuses[stepId] || "incomplete";
    const stepNumber = index + 1;

    switch (status) {
      case "complete":
        return (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-all duration-300 shadow-sm">
            <CheckCircle2 className="h-6 w-6 animate-in zoom-in-50 duration-300" />
          </div>
        );
      case "error":
        return (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-all duration-300 shadow-sm">
            <AlertCircle className="h-6 w-6 animate-in zoom-in-50 duration-300" />
          </div>
        );
      case "current":
        return (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20 transition-all duration-300 shadow-md">
            <span className="text-sm font-semibold">{stepNumber}</span>
          </div>
        );
      case "incomplete":
      default:
        return (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background text-muted-foreground transition-all duration-300">
            <span className="text-sm font-medium">{stepNumber}</span>
          </div>
        );
    }
  };

  const getConnectorColor = (currentIndex: number) => {
    const currentStatus = stepStatuses[steps[currentIndex].id] || "incomplete";
    const nextStatus = stepStatuses[steps[currentIndex + 1]?.id] || "incomplete";

    if (currentStatus === "complete" && nextStatus === "complete") {
      return "bg-green-500";
    }
    if (currentStatus === "complete" || currentStatus === "current") {
      return "bg-primary/30";
    }
    return "bg-muted-foreground/20";
  };

  return (
    <div className={cn("sticky top-6 w-full max-w-sm", className)}>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-semibold">Application Progress</h3>
        <div className="space-y-0">
          {steps.map((step, index) => {
            const status = stepStatuses[step.id] || "incomplete";
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "flex w-full items-start gap-4 py-3 text-left transition-all duration-200 hover:bg-muted/50 rounded-md px-2 -ml-2",
                    status === "current" && "bg-muted/30"
                  )}
                  aria-label={`Go to ${step.title}`}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  <div className="relative flex flex-col items-center">
                    {getStepIcon(step.id, index)}
                    {!isLast && (
                      <div
                        className={cn(
                          "mt-1 h-12 w-0.5 transition-all duration-500",
                          getConnectorColor(index)
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        status === "complete" && "text-green-700 dark:text-green-400",
                        status === "error" && "text-red-700 dark:text-red-400",
                        status === "current" && "text-foreground",
                        status === "incomplete" && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerticalStepper;
