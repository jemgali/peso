import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { FieldGroup, FieldLabel } from "@/ui/field";
import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";
import { X, Plus } from "lucide-react";
import type { FormSectionWithFieldArrayProps } from "./types";

const SkillsSection: React.FC<FormSectionWithFieldArrayProps> = ({
  isPending,
  skillsFieldArray,
}) => {
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  // Fetch skills from JSON
  useEffect(() => {
    fetch("/data/skills-list.json")
      .then((res) => res.json())
      .then((data: Record<string, string>) => {
        // Exclude "Others" from the checkbox list — handled separately
        setSkillsList(Object.keys(data).filter((s) => s !== "Others"));
      })
      .catch(console.error);
  }, []);

  const selectedSkills = useMemo(
    () => skillsFieldArray?.fields || [],
    [skillsFieldArray?.fields]
  );

  const selectedValues = useMemo(
    () => selectedSkills.map((s) => s.value ?? ""),
    [selectedSkills]
  );

  // Custom skills = skills selected that are NOT in the predefined list
  const customSkills = useMemo(
    () => selectedValues.filter((v) => v && !skillsList.includes(v)),
    [selectedValues, skillsList]
  );

  const handleToggleSkill = (skillName: string) => {
    if (!skillsFieldArray) return;

    const existingIndex = selectedSkills.findIndex(
      (s) => s.value === skillName
    );
    if (existingIndex !== -1) {
      skillsFieldArray.remove(existingIndex);
    } else {
      skillsFieldArray.append({ value: skillName });
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed || !skillsFieldArray) return;

    // Prevent duplicates
    const exists = selectedValues.includes(trimmed);
    if (!exists) {
      skillsFieldArray.append({ value: trimmed });
    }
    setCustomSkill("");
  };

  const handleRemoveCustomSkill = (skillName: string) => {
    if (!skillsFieldArray) return;
    const index = selectedSkills.findIndex((s) => s.value === skillName);
    if (index !== -1) {
      skillsFieldArray.remove(index);
    }
  };

  return (
    <div id="skills" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Skills &amp; Competencies</h2>
        <p className="text-sm text-muted-foreground">
          Select your skills from the list below. Use &quot;Others&quot; to add
          custom skills.
        </p>
      </div>

      <FieldGroup>
        <div className="space-y-5">
          <FieldLabel>Select Your Skills</FieldLabel>

          {/* Checkbox grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillsList.map((skill) => {
              const isChecked = selectedValues.includes(skill);
              return (
                <label
                  key={skill}
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggleSkill(skill)}
                    disabled={isPending}
                  />
                  <span className="text-sm select-none">{skill}</span>
                </label>
              );
            })}
          </div>

          {/* Others section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2.5">
              <Checkbox
                checked={showCustomInput}
                onCheckedChange={(checked) =>
                  setShowCustomInput(checked === true)
                }
                disabled={isPending}
              />
              <span className="text-sm font-medium">
                Others (specify custom skills)
              </span>
            </div>

            {showCustomInput && (
              <div className="space-y-3 pl-7">
                {/* Custom skill input */}
                <div className="flex gap-2">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Type a custom skill..."
                    disabled={isPending}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomSkill}
                    disabled={isPending || !customSkill.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Custom skill badges */}
                {customSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveCustomSkill(skill)}
                          disabled={isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedSkills.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              No skills selected yet. Check the skills above or add custom ones
              with &quot;Others&quot;.
            </p>
          )}
        </div>
      </FieldGroup>
    </div>
  );
};

export default SkillsSection;
