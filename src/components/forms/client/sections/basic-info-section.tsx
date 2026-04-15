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

import { Controller, useWatch } from "react-hook-form";

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

const DisabilityGroup = ({ control, setValue, isPending, errors }: any) => {
  const profileDisability = useWatch({ control, name: "profileDisability" }) || "";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="space-y-3">
        <FieldLabel>Disability (if applicable)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {["Visual", "Speech", "Hearing", "Physical", "Psychosocial"].map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-input text-primary focus:ring-primary"
                checked={profileDisability.includes(d)}
                disabled={isPending}
                onChange={(e) => {
                  const items = profileDisability.split(",").map((i: string) => i.trim()).filter(Boolean);
                  let next;
                  if (e.target.checked) {
                    next = [...items, d].join(", ");
                  } else {
                    next = items.filter((i: string) => i !== d).join(", ");
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
              checked={profileDisability.includes("Others:")}
              disabled={isPending}
              onChange={(e) => {
                const items = profileDisability.split(",").map((i: string) => i.trim()).filter(Boolean);
                let next;
                if (e.target.checked) {
                  next = [...items, "Others:"].join(", ");
                } else {
                  next = items.filter((i: string) => !i.startsWith("Others:")).join(", ");
                }
                setValue?.("profileDisability", next, { shouldValidate: true });
              }}
            />
            Others
          </label>
        </div>
        {profileDisability.includes("Others:") && (
          <Input
            className="mt-2"
            placeholder="Please specify"
            disabled={isPending}
            value={profileDisability.split("Others:")[1]?.trim() || ""}
            onChange={(e) => {
              const items = profileDisability.split(",").map((i: string) => i.trim()).filter(Boolean);
              const specified = e.target.value;
              const next = items.map((i: string) => i.startsWith("Others:") ? `Others: ${specified}` : i).join(", ");
              setValue?.("profileDisability", next, { shouldValidate: true });
            }}
          />
        )}
      </div>

      <TextField
        name="profilePwdId"
        label="PWD ID Number"
        register={(name: any, options?: any) => control.register(name, options)}
        error={errors.profilePwdId?.message}
        disabled={isPending || !profileDisability.trim()}
        placeholder={!profileDisability.trim() ? "N/A" : "PWD ID"}
        required={!!profileDisability.trim()}
      />
    </div>
  );
};

const LanguageGroup = ({ control, setValue, isPending, errors }: any) => {
  const [cldrLanguages, setCldrLanguages] = useState<{ code: string; name: string }[]>([]);
  const [languageSearch, setLanguageSearch] = useState("");
  const selectedLanguages = useWatch({ control, name: "profileLanguageDialect" }) || [];

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

  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) {
      const commonCodes = ["en", "tl", "ceb", "ilo", "hil", "bik", "war", "pam", "bcl", "pag", "zh", "es", "ar", "ko", "ja"];
      const common = cldrLanguages.filter((l) => commonCodes.includes(l.code));
      return common.length > 0 ? common : cldrLanguages.slice(0, 20);
    }
    const search = languageSearch.toLowerCase();
    return cldrLanguages
      .filter((l) => l.name.toLowerCase().includes(search) || l.code.toLowerCase().includes(search))
      .slice(0, 50);
  }, [cldrLanguages, languageSearch]);

  const handleAddLanguage = (languageName: string) => {
    if (!languageName || !setValue) return;
    const exists = selectedLanguages.some((l: any) => l.value === languageName);
    if (!exists) {
      setValue("profileLanguageDialect", [...selectedLanguages, { value: languageName }], { shouldValidate: true });
    }
    setLanguageSearch("");
  };

  const handleRemoveLanguage = (index: number) => {
    if (!setValue) return;
    const updated = selectedLanguages.filter((_: any, i: number) => i !== index);
    setValue("profileLanguageDialect", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-2 mt-4">
      <FieldLabel required>Languages / Dialects</FieldLabel>

      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLanguages.map((lang: any, index: number) => (
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

      <Combobox<string>
        inputValue={languageSearch}
        onInputValueChange={(value) => setLanguageSearch(value ?? "")}
        onValueChange={(value) => {
          if (value) handleAddLanguage(value);
        }}
      >
        <ComboboxInput placeholder="Search and select languages..." disabled={isPending} showTrigger />
        <ComboboxContent>
          <ComboboxList>
            {filteredLanguages.length === 0 && <ComboboxEmpty>No languages found</ComboboxEmpty>}
            {filteredLanguages.map((lang) => (
              <ComboboxItem key={lang.code} value={lang.name} disabled={selectedLanguages.some((l: any) => l.value === lang.name)}>
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
  );
};

const ReligionDropdown = ({ control, setValue, isPending, errors }: any) => {
  const [religions, setReligions] = useState<string[]>([]);
  const [isOthers, setIsOthers] = useState(false);
  const [customReligion, setCustomReligion] = useState("");

  useEffect(() => {
    fetch("/data/religion-list.json")
      .then((res) => res.json())
      .then((data: Record<string, string>) => {
        setReligions(Object.keys(data));
      })
      .catch(console.error);
  }, []);

  // Check if current value is "Others" custom value
  const currentValue = useWatch({ control, name: "profileReligion" }) || "";
  
  useEffect(() => {
    if (currentValue && religions.length > 0) {
      const isKnown = religions.some((r) => r === currentValue && r !== "Others");
      if (!isKnown && currentValue !== "Others") {
        setIsOthers(true);
        setCustomReligion(currentValue);
      }
    }
  }, [currentValue, religions]);

  return (
    <Field data-invalid={!!errors.profileReligion}>
      <FieldLabel htmlFor="profileReligion" required>
        Religion
      </FieldLabel>
      <select
        value={isOthers ? "Others" : currentValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "Others") {
            setIsOthers(true);
            setCustomReligion("");
            setValue?.("profileReligion", "", { shouldValidate: true });
          } else {
            setIsOthers(false);
            setCustomReligion("");
            setValue?.("profileReligion", val, { shouldValidate: true });
          }
        }}
        disabled={isPending}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select religion...</option>
        {religions.map((religion) => (
          <option key={religion} value={religion}>
            {religion}
          </option>
        ))}
      </select>
      {isOthers && (
        <Input
          className="mt-2"
          placeholder="Please specify your religion"
          disabled={isPending}
          value={customReligion}
          onChange={(e) => {
            setCustomReligion(e.target.value);
            setValue?.("profileReligion", e.target.value, { shouldValidate: true });
          }}
        />
      )}
      {errors.profileReligion && (
        <FieldError>{errors.profileReligion.message}</FieldError>
      )}
    </Field>
  );
};

const BasicInfoSection: React.FC<FormSectionWithFieldArrayProps & { disableEmail?: boolean }> = ({
  register,
  errors,
  isPending,
  watch,
  setValue,
  userEmail,
  disableEmail,
  control,
}) => {
  // Height converter state
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");
  const [converterOpen, setConverterOpen] = useState(false);

  // Auto-capitalize hook for name fields
  const { handleBlur: autoCapitalizeBlur } = useAutoCapitalize(setValue);

  // Track if email has been pre-filled
  const emailPrefilledRef = useRef(false);

  // Pre-fill email from auth session (only once, editable by user)
  useEffect(() => {
    if (userEmail && setValue && !emailPrefilledRef.current) {
      // Just try setting it, React Hook Form will handle if it's already got a value from defaultValues
      emailPrefilledRef.current = true;
    }
  }, [userEmail, setValue]);



  // (calculateAge Effect removed to minimize global renders)

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

  // (Language functions extracted to LanguageGroup)

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
              <Controller
                control={control}
                name="profileBirthdate"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    id="profileBirthdate"
                    disabled={isPending}
                    aria-invalid={!!errors.profileBirthdate}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value) {
                        const age = calculateAge(e.target.value);
                        if (age >= 0 && age < 150) {
                          setValue?.("profileAge", age, { shouldValidate: true });
                        } else {
                          setValue?.("profileAge", undefined, { shouldValidate: true });
                        }
                      } else {
                        setValue?.("profileAge", undefined, { shouldValidate: true });
                      }
                    }}
                  />
                )}
              />
              {errors.profileBirthdate && (
                <FieldError>{errors.profileBirthdate.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileAge}>
              <FieldLabel htmlFor="profileAge">Age</FieldLabel>
              <Controller
                control={control}
                name="profileAge"
                render={({ field }) => (
                  <Input
                    type="number"
                    id="profileAge"
                    value={field.value ?? ""}
                    readOnly
                    disabled
                    placeholder="Auto-calculated"
                    aria-invalid={!!errors.profileAge}
                    className="bg-muted"
                  />
                )}
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
              <Controller
                control={control}
                name="profileSex"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value || ""}
                    onValueChange={field.onChange}
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
                )}
              />
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

            <ReligionDropdown control={control} setValue={setValue} isPending={isPending} errors={errors} />

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

          {/* Language/Dialect */}
          <LanguageGroup control={control} setValue={setValue} isPending={isPending} errors={errors} />

          {/* Disability Information */}
          <DisabilityGroup 
            control={control} 
            setValue={setValue} 
            isPending={isPending} 
            errors={errors} 
          />
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default BasicInfoSection;
