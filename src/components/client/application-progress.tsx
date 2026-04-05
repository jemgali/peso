"use client";

import React from "react";
import { Card } from "@/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/ui/progress";

interface ProgressStep {
  id: number;
  title: string;
  description: string;
}

const steps: ProgressStep[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Name and role",
  },
  {
    id: 2,
    title: "Personal Details",
    description: "Birthdate and demographics",
  },
  {
    id: 3,
    title: "Contact Information",
    description: "Communication details",
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Verify and submit",
  },
];

interface ApplicationProgressProps {
  currentStep?: number;
}

const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  currentStep = 1,
}) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <Card className="p-4 sticky top-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Application Progress</h3>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                step.id < currentStep
                  ? "bg-green-50 dark:bg-green-950"
                  : step.id === currentStep
                    ? "bg-blue-50 dark:bg-blue-950"
                    : "bg-muted"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.id < currentStep ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : step.id === currentStep ? (
                  <Circle className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-current" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.id <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ApplicationProgress;
