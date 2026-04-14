"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Baby } from "lucide-react";

export type ApplicationType = "new" | "spes-baby";

interface TypeSelectionProps {
  onSelect: (type: ApplicationType) => void;
}

export default function TypeSelection({ onSelect }: TypeSelectionProps) {
  return (
    <div className="mx-auto max-w-2xl w-full min-h-[50vh] flex flex-col justify-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Select Application Type</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please select the type of application you are filing for SPES.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="flex flex-col items-center justify-center p-6 text-center hover:border-primary transition-colors cursor-pointer" 
          onClick={() => onSelect("new")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect("new");
            }
          }}
        >
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <UserPlus className="size-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">New Applicant</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            For individuals applying to the Special Program for Employment of Students for the first time.
          </p>
          <Button variant="outline" className="w-full pointer-events-none">Select</Button>
        </Card>

        <Card 
          className="flex flex-col items-center justify-center p-6 text-center hover:border-primary transition-colors cursor-pointer" 
          onClick={() => onSelect("spes-baby")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect("spes-baby");
            }
          }}
        >
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Baby className="size-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">SPES Baby</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            For individuals who have successfully completed the SPES program in previous years.
          </p>
          <Button variant="outline" className="w-full pointer-events-none">Select</Button>
        </Card>
      </div>
    </div>
  );
}
