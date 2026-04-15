import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { FieldGroup, FieldLabel } from "@/ui/field";
import { Badge } from "@/ui/badge";
import { X } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/ui/combobox";
import type { FormSectionWithFieldArrayProps } from "./types";

const SkillsSection: React.FC<FormSectionWithFieldArrayProps> = ({
  isPending,
  skillsFieldArray,
}) => {
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  // Fetch skills from JSON
  useEffect(() => {
    fetch("/data/skills-list.json")
      .then((res) => res.json())
      .then((data: Record<string, string>) => {
        setSkillsList(Object.keys(data));
      })
      .catch(console.error);
  }, []);

  const selectedSkills = useMemo(() => skillsFieldArray?.fields || [], [skillsFieldArray?.fields]);

  // Filter skills by search, exclude already selected
  const filteredSkills = useMemo(() => {
    const selectedValues = selectedSkills.map((s: { value: string }) => s.value);
    let filtered = skillsList.filter((s) => !selectedValues.includes(s) && s !== "Others");
    if (skillSearch) {
      const search = skillSearch.toLowerCase();
      filtered = filtered.filter((s) => s.toLowerCase().includes(search));
    }
    return filtered;
  }, [skillsList, skillSearch, selectedSkills]);

  const handleAddSkill = (skillName: string) => {
    if (!skillName || !skillsFieldArray) return;
    const exists = selectedSkills.some((s: { value: string }) => s.value === skillName);
    if (!exists) {
      skillsFieldArray.append({ value: skillName });
    }
    setSkillSearch("");
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    handleAddSkill(customSkill.trim());
    setCustomSkill("");
    setShowCustomInput(false);
  };

  return (
    <div id="skills" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Skills & Competencies</h2>
        <p className="text-sm text-muted-foreground">
          Select your skills from the dropdown or add custom ones with
          &quot;Others&quot;
        </p>
      </div>

      <FieldGroup>
        <div className="space-y-4">
          <FieldLabel>Your Skills</FieldLabel>

          {/* Selected skills as badges */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((field: { id: string; value: string }, index: number) => (
                <Badge key={field.id} variant="secondary" className="gap-1 pr-1">
                  {field.value}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => skillsFieldArray?.remove(index)}
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Skills dropdown */}
          <Combobox<string>
            inputValue={skillSearch}
            onInputValueChange={(value) => setSkillSearch(value ?? "")}
            onValueChange={(value) => {
              if (value === "Others") {
                setShowCustomInput(true);
                setSkillSearch("");
              } else if (value) {
                handleAddSkill(value);
              }
            }}
          >
            <ComboboxInput
              placeholder="Search and select skills..."
              disabled={isPending}
              showTrigger
            />
            <ComboboxContent>
              <ComboboxList>
                {filteredSkills.length === 0 && !skillSearch && (
                  <ComboboxEmpty>All skills selected</ComboboxEmpty>
                )}
                {filteredSkills.length === 0 && skillSearch && (
                  <ComboboxEmpty>No matching skills found</ComboboxEmpty>
                )}
                {filteredSkills.map((skill) => (
                  <ComboboxItem key={skill} value={skill}>
                    {skill}
                  </ComboboxItem>
                ))}
                {/* Always show Others option */}
                <ComboboxItem value="Others" className="text-primary font-medium">
                  Others (specify custom skill)
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {/* Custom skill input - shown when "Others" is selected */}
          {showCustomInput && (
            <div className="flex gap-2">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Type your custom skill..."
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
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSkill("");
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          )}

          {selectedSkills.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              No skills added yet. Select from the dropdown above or add custom
              skills.
            </p>
          )}
        </div>
      </FieldGroup>
    </div>
  );
};

export default SkillsSection;
