import React, { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { X, Ruler } from "lucide-react";
import { Field, FieldSet, FieldGroup, FieldLabel, FieldError } from "@/ui/field";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Label } from "@/ui/label";
import { Badge } from "@/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/ui/input-group";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/ui/combobox";
import { TextField } from "@/components/shared";
import { useAutoCapitalize } from "@/hooks/use-auto-capitalize";
import type { FormSectionWithFieldArrayProps } from "./types";

// CLDR language data type
interface CLDRLanguageData {
  main: {
    en: {
      localeDisplayNames: {
        languages: Record<string, string>;
      };
    };
  };
}

// Calculate age from birthdate
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const BasicInfoSection: React.FC<FormSectionWithFieldArrayProps & { disableEmail?: boolean }> = ({
  register,
  errors,
  isPending,
  watch,
  setValue,
  userEmail,
  disableEmail,
}) => {
  // Height converter state
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");
  const [converterOpen, setConverterOpen] = useState(false);

  // CLDR languages state
  const [cldrLanguages, setCldrLanguages] = useState<
    { code: string; name: string }[]
  >([]);
  const [languageSearch, setLanguageSearch] = useState("");
  
  // Track if email has been pre-filled
  const emailPrefilledRef = useRef(false);

  // Watch form values for reactivity
  const birthdate = watch?.("profileBirthdate");
  const currentSex = watch?.("profileSex");
  const currentAge = watch?.("profileAge");
  const currentEmail = watch?.("profileEmail");
  const selectedLanguages = watch?.("profileLanguageDialect") || [];

  // Auto-capitalize hook for name fields
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);

  // Pre-fill email from auth session (only once, editable by user)
  useEffect(() => {
    if (userEmail && setValue && !emailPrefilledRef.current && !currentEmail) {
      setValue("profileEmail", userEmail, { shouldValidate: false });
      emailPrefilledRef.current = true;
    }
  }, [userEmail, setValue, currentEmail]);

  // Load CLDR languages on mount
  useEffect(() => {
    fetch("/cldr-data/languages.json")
      .then((res) => res.json())
      .then((data: CLDRLanguageData) => {
        const langs = data.main.en.localeDisplayNames.languages;
        const parsed = Object.entries(langs)
          .filter(([code, name]) => 
            !code.includes("-alt-") && 
            !code.includes("-") &&
            !name.toLowerCase().includes("old ") &&
            !name.toLowerCase().includes("variant")
          )
          .map(([code, name]) => ({ code, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCldrLanguages(parsed);
      })
      .catch(console.error);
  }, []);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) {
      // Show common languages when no search
      const commonCodes = [
        "en",
        "tl",
        "ceb",
        "ilo",
        "hil",
        "bik",
        "war",
        "pam",
        "bcl",
        "pag",
        "zh",
        "es",
        "ar",
        "ko",
        "ja",
      ];
      const common = cldrLanguages.filter((l) => commonCodes.includes(l.code));
      return common.length > 0 ? common : cldrLanguages.slice(0, 20);
    }
    const search = languageSearch.toLowerCase();
    return cldrLanguages
      .filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.code.toLowerCase().includes(search),
      )
      .slice(0, 50);
  }, [cldrLanguages, languageSearch]);

  // Auto-calculate age when birthdate changes
  useEffect(() => {
    if (setValue) {
      if (birthdate) {
        const age = calculateAge(birthdate);
        if (age >= 0 && age < 150) {
          setValue("profileAge", age, { shouldValidate: true });
        } else {
          // Clear stale age when birthdate is invalid
          setValue("profileAge", undefined, { shouldValidate: true });
        }
      } else {
        // Clear age when birthdate is empty
        setValue("profileAge", undefined, { shouldValidate: true });
      }
    }
  }, [birthdate, setValue]);

  // Convert feet/inches to cm
  const handleConvert = () => {
    const feetNum = parseFloat(feet) || 0;
    const inchesNum = parseFloat(inches) || 0;
    const totalInches = feetNum * 12 + inchesNum;
    const cm = Math.round(totalInches * 2.54);
    if (cm > 0 && setValue) {
      setValue("profileHeight", cm, { shouldValidate: true });
      setConverterOpen(false);
      setFeet("");
      setInches("");
    }
  };

  // Add a language
  const handleAddLanguage = (languageName: string) => {
    if (!languageName || !setValue) return;
    const current = selectedLanguages || [];
    const exists = current.some((l) => l.value === languageName);
    if (!exists) {
      setValue(
        "profileLanguageDialect",
        [...current, { value: languageName }],
        { shouldValidate: true },
      );
    }
    setLanguageSearch("");
  };

  // Remove a language
  const handleRemoveLanguage = (index: number) => {
    if (!setValue) return;
    const current = selectedLanguages || [];
    const updated = current.filter((_, i) => i !== index);
    setValue("profileLanguageDialect", updated, { shouldValidate: true });
  };

  return (
    <div id="basic-info" className="scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide your personal information
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              name="profileLastName"
              label="Last Name"
              register={register}
              error={errors.profileLastName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="Dela Cruz"
              required
              onBlur={autoCapitalizeBlur("profileLastName")}
            />

            <TextField
              name="profileFirstName"
              label="First Name"
              register={register}
              error={errors.profileFirstName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="Juan"
              required
              onBlur={autoCapitalizeBlur("profileFirstName")}
            />

            <TextField
              name="profileMiddleName"
              label="Middle Name"
              register={register}
              error={errors.profileMiddleName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="Antonio"
              onBlur={autoCapitalizeBlur("profileMiddleName")}
            />

            <TextField
              name="profileSuffix"
              label="Suffix"
              register={register}
              error={errors.profileSuffix?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="Jr, Sr"
              onBlur={autoCapitalizeBlur("profileSuffix")}
            />
          </div>

          {/* Personal Details - merged with contact details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Field data-invalid={!!errors.profileBirthdate}>
              <FieldLabel htmlFor="profileBirthdate" required>
                Date of Birth
              </FieldLabel>
              <Input
                {...register("profileBirthdate")}
                type="date"
                id="profileBirthdate"
                disabled={isPending}
                aria-invalid={!!errors.profileBirthdate}
              />
              {errors.profileBirthdate && (
                <FieldError>{errors.profileBirthdate.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileAge}>
              <FieldLabel htmlFor="profileAge">Age</FieldLabel>
              <Input
                type="number"
                id="profileAge"
                value={currentAge ?? ""}
                readOnly
                disabled
                placeholder="Auto-calculated"
                aria-invalid={!!errors.profileAge}
                className="bg-muted"
              />
              {errors.profileAge && (
                <FieldError>{errors.profileAge.message}</FieldError>
              )}
            </Field>

            <TextField
              name="profilePlaceOfBirth"
              label="Place of Birth"
              register={register}
              error={errors.profilePlaceOfBirth?.message}
              disabled={isPending}
              placeholder="City, Province"
              required
            />

            <Field data-invalid={!!errors.profileSex}>
              <FieldLabel required>Sex</FieldLabel>
              <input type="hidden" {...register("profileSex")} />
              <RadioGroup
                value={currentSex || ""}
                onValueChange={(val) =>
                  setValue?.("profileSex", val, { shouldValidate: true })
                }
                disabled={isPending}
                className="flex gap-6 h-10 items-center"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Male" id="sex-male" />
                  <Label
                    htmlFor="sex-male"
                    className="font-normal cursor-pointer"
                  >
                    Male
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Female" id="sex-female" />
                  <Label
                    htmlFor="sex-female"
                    className="font-normal cursor-pointer"
                  >
                    Female
                  </Label>
                </div>
              </RadioGroup>
              {errors.profileSex && (
                <FieldError>{errors.profileSex.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileHeight}>
              <FieldLabel htmlFor="profileHeight" required>
                Height (cm)
              </FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput
                  {...register("profileHeight")}
                  type="number"
                  id="profileHeight"
                  disabled={isPending}
                  placeholder="170"
                  aria-invalid={!!errors.profileHeight}
                />
                <InputGroupAddon align="inline-end">
                  <Popover open={converterOpen} onOpenChange={setConverterOpen}>
                    <PopoverTrigger asChild>
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isPending}
                      >
                        <Ruler className="h-4 w-4" />
                        Convert
                      </InputGroupButton>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-64" 
                      align="end" 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">
                          Height Converter
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Enter height in feet and inches
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="feet" className="text-xs">
                              Feet
                            </Label>
                            <Input
                              id="feet"
                              type="number"
                              min="0"
                              max="8"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              placeholder="5"
                              className="h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="inches" className="text-xs">
                              Inches
                            </Label>
                            <Input
                              id="inches"
                              type="number"
                              min="0"
                              max="11"
                              step="0.5"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              placeholder="6"
                              className="h-8"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          onClick={handleConvert}
                          disabled={!feet && !inches}
                        >
                          Convert to CM
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </InputGroupAddon>
              </InputGroup>
              {errors.profileHeight && (
                <FieldError>{errors.profileHeight.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileCivilStatus}>
              <FieldLabel htmlFor="profileCivilStatus" required>
                Civil Status
              </FieldLabel>
              <select
                {...register("profileCivilStatus")}
                id="profileCivilStatus"
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.profileCivilStatus}
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.profileCivilStatus && (
                <FieldError>{errors.profileCivilStatus.message}</FieldError>
              )}
            </Field>

            <TextField
              name="profileReligion"
              label="Religion"
              register={register}
              error={errors.profileReligion?.message}
              disabled={isPending}
              placeholder="e.g., Catholic, Christian, Muslim"
              required
            />

            {/* Contact Details - merged below Religion */}
            <TextField
              name="profileEmail"
              label="Email Address"
              register={register}
              error={errors.profileEmail?.message}
              disabled={isPending || disableEmail}
              type="email"
              placeholder="email@example.com"
              required
              className={disableEmail ? "bg-muted" : ""}
            />

            <TextField
              name="profileContact"
              label="Contact Number"
              register={register}
              error={errors.profileContact?.message}
              disabled={isPending}
              type="tel"
              placeholder="+63 9XX-XXX-XXXX"
              required
            />

            <TextField
              name="profileFacebook"
              label="Facebook Profile URL (Optional)"
              register={register}
              error={errors.profileFacebook?.message}
              disabled={isPending}
              type="url"
              placeholder="https://facebook.com/username"
            />
          </div>

          {/* Language/Dialect - CLDR Combobox with Badges */}
          <div className="space-y-2 mt-4">
            <FieldLabel required>Languages / Dialects</FieldLabel>

            {/* Selected Languages as Badges */}
            {selectedLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedLanguages.map((lang, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pr-1">
                    {lang.value}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveLanguage(index)}
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Language Combobox */}
            <Combobox<string>
              inputValue={languageSearch}
              onInputValueChange={(value) => setLanguageSearch(value ?? "")}
              onValueChange={(value) => {
                if (value) {
                  handleAddLanguage(value);
                }
              }}
            >
              <ComboboxInput
                placeholder="Search and select languages..."
                disabled={isPending}
                showTrigger
              />
              <ComboboxContent>
                <ComboboxList>
                  {filteredLanguages.length === 0 && (
                    <ComboboxEmpty>No languages found</ComboboxEmpty>
                  )}
                  {filteredLanguages.map((lang) => (
                    <ComboboxItem
                      key={lang.code}
                      value={lang.name}
                      disabled={selectedLanguages.some(
                        (l) => l.value === lang.name,
                      )}
                    >
                      {lang.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {errors.profileLanguageDialect && (
              <FieldError>{errors.profileLanguageDialect.message}</FieldError>
            )}
          </div>

          {/* Disability Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <FieldLabel>Disability (if applicable)</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {["Visual", "Speech", "Hearing", "Physical", "Psychosocial"].map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary"
                      checked={(watch?.("profileDisability") || "").includes(d)}
                      disabled={isPending}
                      onChange={(e) => {
                        const current = watch?.("profileDisability") || "";
                        const items = current.split(",").map(i => i.trim()).filter(Boolean);
                        let next;
                        if (e.target.checked) {
                          next = [...items, d].join(", ");
                        } else {
                          next = items.filter(i => i !== d).join(", ");
                        }
                        setValue?.("profileDisability", next, { shouldValidate: true });
                      }}
                    />
                    {d}
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary"
                    checked={(watch?.("profileDisability") || "").includes("Others:")}
                    disabled={isPending}
                    onChange={(e) => {
                      const current = watch?.("profileDisability") || "";
                      const items = current.split(",").map(i => i.trim()).filter(Boolean);
                      let next;
                      if (e.target.checked) {
                        next = [...items, "Others:"].join(", ");
                      } else {
                        // Remove "Others:" and whatever follows it in the string if we had a dedicated array,
                        // but since it's a string, we just remove "Others:" and the custom text.
                        next = items.filter(i => !i.startsWith("Others:")).join(", ");
                      }
                      setValue?.("profileDisability", next, { shouldValidate: true });
                    }}
                  />
                  Others
                </label>
              </div>
              {(watch?.("profileDisability") || "").includes("Others:") && (
                <Input
                  className="mt-2"
                  placeholder="Please specify"
                  disabled={isPending}
                  value={(watch?.("profileDisability") || "").split("Others:")[1]?.trim() || ""}
                  onChange={(e) => {
                    const current = watch?.("profileDisability") || "";
                    const items = current.split(",").map(i => i.trim()).filter(Boolean);
                    const specified = e.target.value;
                    const next = items.map(i => i.startsWith("Others:") ? `Others: ${specified}` : i).join(", ");
                    setValue?.("profileDisability", next, { shouldValidate: true });
                  }}
                />
              )}
            </div>

            <TextField
              name="profilePwdId"
              label="PWD ID Number"
              register={register}
              error={errors.profilePwdId?.message}
              disabled={isPending || !(watch?.("profileDisability") || "").trim()}
              placeholder={!(watch?.("profileDisability") || "").trim() ? "N/A" : "PWD ID"}
              required={!!(watch?.("profileDisability") || "").trim()}
            />
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default BasicInfoSection;
