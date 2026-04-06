import React from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { FieldGroup, FieldLabel } from "@/ui/field";
import { Plus, X } from "lucide-react";
import type { FormSectionWithFieldArrayProps } from "./types";

const SkillsSection: React.FC<FormSectionWithFieldArrayProps> = ({
  register,
  isPending,
  setSectionRef,
  skillsFieldArray,
}) => {
  return (
    <div
      id="skills"
      ref={setSectionRef("skills")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Skills & Competencies</h2>
        <p className="text-sm text-muted-foreground">
          List your skills, abilities, and competencies that may be relevant to
          employment
        </p>
      </div>

      <FieldGroup>
        <div className="space-y-4">
          <FieldLabel>Your Skills</FieldLabel>
          <div className="space-y-2">
            {skillsFieldArray?.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`skills.${index}.value` as const)}
                  type="text"
                  disabled={isPending}
                  placeholder="e.g., Computer Literate, Customer Service, Data Entry"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => skillsFieldArray.remove(index)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {(!skillsFieldArray?.fields ||
              skillsFieldArray.fields.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                No skills added yet. Click the button below to add your first
                skill.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => skillsFieldArray?.append({ value: "" })}
              disabled={isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Skill Examples</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Computer Literate",
                "Microsoft Office",
                "Data Entry",
                "Customer Service",
                "Communication",
                "Teamwork",
                "Problem Solving",
                "Time Management",
                "Basic Accounting",
                "Filing & Documentation",
                "Social Media",
                "Photography",
                "Graphic Design",
                "Cooking",
                "Driving",
              ].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => skillsFieldArray?.append({ value: skill })}
                  disabled={isPending}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
};

export default SkillsSection;
