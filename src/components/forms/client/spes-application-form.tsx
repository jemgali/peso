"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Select } from "@/ui/select";
import { Label } from "@/ui/label";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import { Card } from "@/ui/card";
import { Spinner } from "@/ui/spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Validation schemas for each step
const basicInfoSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().default(""),
  suffix: z.string().optional().default(""),
  profileRole: z.string().min(1, "Role is required"),
});

const personalDetailsSchema = z.object({
  birthdate: z.string().optional().default(""),
  age: z.coerce.number().optional(),
  placeOfBirth: z.string().optional().default(""),
  sex: z.string().optional().default(""),
  height: z.coerce.number().optional(),
  civilStatus: z.string().optional().default(""),
});

const contactInfoSchema = z.object({
  languageDialect: z.string().optional().default(""),
  contact: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
});

const completeSchema = z.object({
  ...basicInfoSchema.shape,
  ...personalDetailsSchema.shape,
  ...contactInfoSchema.shape,
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;
type CompleteFormValues = z.infer<typeof completeSchema>;

const SPESApplicationForm = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      profileRole: "",
      birthdate: "",
      age: undefined,
      placeOfBirth: "",
      sex: "",
      height: undefined,
      civilStatus: "",
      languageDialect: "",
      contact: "",
      facebook: "",
    },
    mode: "onChange",
  });

  const formValues = watch();

  const handleNext = async () => {
    try {
      let isValid = false;

      if (step === 1) {
        isValid = await trigger(["lastName", "firstName", "profileRole"]);
      } else if (step === 2) {
        isValid = true; // Personal details are optional
      } else if (step === 3) {
        isValid = true; // Contact info is optional
      }

      if (isValid) {
        setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
      }
    } catch (error) {
      toast.error("Please check your entries and try again");
    }
  };

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev));
  };

  const onSubmit = async (data: CompleteFormValues) => {
    setIsPending(true);
    try {
      // Here you would make an API call to save the application
      const response = await fetch("/api/client/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      // Redirect or reset form as needed
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <p className="text-sm text-muted-foreground">
              Please provide your basic personal information
            </p>
          </div>

          <FieldGroup>
            <FieldSet className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!errors.lastName}>
                  <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                  <Input
                    {...register("lastName")}
                    type="text"
                    id="lastName"
                    disabled={isPending}
                    autoCapitalize="words"
                    placeholder="Dela Cruz"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <FieldError>{errors.lastName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                  <Input
                    {...register("firstName")}
                    type="text"
                    id="firstName"
                    disabled={isPending}
                    autoCapitalize="words"
                    placeholder="Juan"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <FieldError>{errors.firstName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.middleName}>
                  <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
                  <Input
                    {...register("middleName")}
                    type="text"
                    id="middleName"
                    disabled={isPending}
                    autoCapitalize="words"
                    placeholder="Antonio"
                    aria-invalid={!!errors.middleName}
                  />
                  {errors.middleName && (
                    <FieldError>{errors.middleName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.suffix}>
                  <FieldLabel htmlFor="suffix">Suffix</FieldLabel>
                  <Input
                    {...register("suffix")}
                    type="text"
                    id="suffix"
                    disabled={isPending}
                    autoCapitalize="words"
                    placeholder="Jr, Sr"
                    aria-invalid={!!errors.suffix}
                  />
                  {errors.suffix && (
                    <FieldError>{errors.suffix.message}</FieldError>
                  )}
                </Field>
              </div>

              <Field data-invalid={!!errors.profileRole}>
                <FieldLabel htmlFor="profileRole">
                  Role / Designation *
                </FieldLabel>
                <Input
                  {...register("profileRole")}
                  type="text"
                  id="profileRole"
                  disabled={isPending}
                  placeholder="e.g., Applicant, Job Seeker"
                  aria-invalid={!!errors.profileRole}
                />
                {errors.profileRole && (
                  <FieldError>{errors.profileRole.message}</FieldError>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>
        </div>
      )}

      {/* Step 2: Personal Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Personal Details</h2>
            <p className="text-sm text-muted-foreground">
              Tell us more about yourself
            </p>
          </div>

          <FieldGroup>
            <FieldSet className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!errors.birthdate}>
                  <FieldLabel htmlFor="birthdate">Date of Birth</FieldLabel>
                  <Input
                    {...register("birthdate")}
                    type="date"
                    id="birthdate"
                    disabled={isPending}
                    aria-invalid={!!errors.birthdate}
                  />
                  {errors.birthdate && (
                    <FieldError>{errors.birthdate.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.age}>
                  <FieldLabel htmlFor="age">Age</FieldLabel>
                  <Input
                    {...register("age")}
                    type="number"
                    id="age"
                    disabled={isPending}
                    placeholder="25"
                    aria-invalid={!!errors.age}
                  />
                  {errors.age && <FieldError>{errors.age.message}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.placeOfBirth}>
                  <FieldLabel htmlFor="placeOfBirth">Place of Birth</FieldLabel>
                  <Input
                    {...register("placeOfBirth")}
                    type="text"
                    id="placeOfBirth"
                    disabled={isPending}
                    placeholder="City, Province"
                    aria-invalid={!!errors.placeOfBirth}
                  />
                  {errors.placeOfBirth && (
                    <FieldError>{errors.placeOfBirth.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.sex}>
                  <FieldLabel htmlFor="sex">Sex</FieldLabel>
                  <select
                    {...register("sex")}
                    id="sex"
                    disabled={isPending}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!errors.sex}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.sex && <FieldError>{errors.sex.message}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.height}>
                  <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
                  <Input
                    {...register("height")}
                    type="number"
                    id="height"
                    disabled={isPending}
                    placeholder="170"
                    aria-invalid={!!errors.height}
                  />
                  {errors.height && (
                    <FieldError>{errors.height.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.civilStatus}>
                  <FieldLabel htmlFor="civilStatus">Civil Status</FieldLabel>
                  <select
                    {...register("civilStatus")}
                    id="civilStatus"
                    disabled={isPending}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!errors.civilStatus}
                  >
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                  {errors.civilStatus && (
                    <FieldError>{errors.civilStatus.message}</FieldError>
                  )}
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              How should we reach you?
            </p>
          </div>

          <FieldGroup>
            <FieldSet className="gap-4">
              <Field data-invalid={!!errors.languageDialect}>
                <FieldLabel htmlFor="languageDialect">
                  Languages / Dialects
                </FieldLabel>
                <Textarea
                  {...register("languageDialect")}
                  id="languageDialect"
                  disabled={isPending}
                  placeholder="e.g., English, Tagalog, Spanish"
                  aria-invalid={!!errors.languageDialect}
                  className="min-h-24"
                />
                {errors.languageDialect && (
                  <FieldError>{errors.languageDialect.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.contact}>
                <FieldLabel htmlFor="contact">Contact Number</FieldLabel>
                <Input
                  {...register("contact")}
                  type="tel"
                  id="contact"
                  disabled={isPending}
                  placeholder="+63 9XX-XXX-XXXX"
                  aria-invalid={!!errors.contact}
                />
                {errors.contact && (
                  <FieldError>{errors.contact.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.facebook}>
                <FieldLabel htmlFor="facebook">Facebook URL</FieldLabel>
                <Input
                  {...register("facebook")}
                  type="url"
                  id="facebook"
                  disabled={isPending}
                  placeholder="https://facebook.com/username"
                  aria-invalid={!!errors.facebook}
                />
                {errors.facebook && (
                  <FieldError>{errors.facebook.message}</FieldError>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Review Application</h2>
            <p className="text-sm text-muted-foreground">
              Please review your information before submitting
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Legal Name</p>
                  <p className="font-medium">
                    {[
                      formValues.firstName,
                      formValues.middleName,
                      formValues.lastName,
                      formValues.suffix,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{formValues.profileRole}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Birthdate</p>
                  <p className="font-medium">
                    {formValues.birthdate || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">
                    {formValues.age || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Place of Birth</p>
                  <p className="font-medium">
                    {formValues.placeOfBirth || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sex</p>
                  <p className="font-medium">
                    {formValues.sex || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-medium">
                    {formValues.height
                      ? `${formValues.height} cm`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Civil Status</p>
                  <p className="font-medium">
                    {formValues.civilStatus || "Not provided"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-3">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact Number</p>
                  <p className="font-medium">
                    {formValues.contact || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Facebook</p>
                  <p className="font-medium truncate">
                    {formValues.facebook || "Not provided"}
                  </p>
                </div>
              </div>
              {formValues.languageDialect && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm">
                    Languages / Dialects
                  </p>
                  <p className="font-medium text-sm">
                    {formValues.languageDialect}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={step === 1 || isPending}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="ml-auto"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default SPESApplicationForm;
