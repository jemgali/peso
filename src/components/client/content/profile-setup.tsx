"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, User } from "lucide-react";
import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";
import { Card } from "@/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import {
  profileSetupSchema,
  type ProfileSetupFormValues,
} from "@/lib/validations/profile-setup";
import BasicInfoSection from "@/components/forms/client/sections/basic-info-section";

interface ProfileSetupProps {
  userEmail: string;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userEmail }) => {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "review" | "confirm">("form");
  const [isPending, setIsPending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const emailPrefilledRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema) as Resolver<ProfileSetupFormValues>,
    defaultValues: {
      profileLastName: "",
      profileFirstName: "",
      profileMiddleName: "",
      profileSuffix: "",
      profileBirthdate: "",
      profileAge: undefined,
      profilePlaceOfBirth: "",
      profileSex: "",
      profileHeight: undefined,
      profileCivilStatus: "",
      profileReligion: "",
      profileLanguageDialect: [],
      profileEmail: userEmail,
      profileContact: "",
      profileFacebook: "",
      profileDisability: "",
      profilePwdId: "",
    },
    mode: "onChange",
  });

  const formValues = watch();

  // Pre-fill email from auth session
  useEffect(() => {
    if (userEmail && !emailPrefilledRef.current) {
      setValue("profileEmail", userEmail, { shouldValidate: false });
      emailPrefilledRef.current = true;
    }
  }, [userEmail, setValue]);

  // Handle "Next" from form to review
  const handleFormNext = async () => {
    const valid = await trigger();
    if (valid) {
      setStep("review");
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  // Handle confirm dialog
  const handleReviewConfirm = () => {
    setShowConfirmDialog(true);
  };

  // Handle final save
  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsPending(true);

    try {
      const response = await fetch("/api/client/profile-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save profile");
      }

      toast.success("Profile setup completed! Welcome to PESO.");
      // Force full page reload to clear router cache and route to application page
      router.refresh();
      window.location.href = "/protected/client/application";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setIsPending(false);
    }
  };

  // Format helpers
  const formatName = () =>
    [
      formValues.profileFirstName,
      formValues.profileMiddleName,
      formValues.profileLastName,
      formValues.profileSuffix,
    ]
      .filter(Boolean)
      .join(" ") || "Not provided";

  const formatLanguages = () => {
    if (!formValues.profileLanguageDialect?.length) return "Not provided";
    return formValues.profileLanguageDialect
      .map((item) => item.value)
      .filter(Boolean)
      .join(", ");
  };

  // === STEP 1: Form ===
  if (step === "form") {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Complete Your Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Please provide your basic information to get started
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
              Fill Info
            </span>
            <ChevronRight className="size-4" />
            <span className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">2</span>
              Review
            </span>
            <ChevronRight className="size-4" />
            <span className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">3</span>
              Confirm
            </span>
          </div>
        </div>

        <Card className="p-5 sm:p-7">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <BasicInfoSection
            register={register as any}
            errors={errors as any}
            isPending={isPending}
            watch={watch as any}
            setValue={setValue as any}
            control={control as any}
            userEmail={userEmail}
            disableEmail
          />

          <div className="flex justify-end mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={handleFormNext}
              disabled={isPending}
            >
              Review Information
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // === STEP 2: Review ===
  if (step === "review") {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Review Your Information
              </h1>
              <p className="text-sm text-muted-foreground">
                Please verify all details before saving
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 text-green-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">✓</span>
              Fill Info
            </span>
            <ChevronRight className="size-4" />
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
              Review
            </span>
            <ChevronRight className="size-4" />
            <span className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">3</span>
              Confirm
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <Card className="bg-muted/30 p-5">
            <h3 className="text-sm font-semibold mb-3">Name</h3>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Last Name</p>
                <p className="font-medium">{formValues.profileLastName || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">First Name</p>
                <p className="font-medium">{formValues.profileFirstName || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Middle Name</p>
                <p className="font-medium">{formValues.profileMiddleName || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Suffix</p>
                <p className="font-medium">{formValues.profileSuffix || "—"}</p>
              </div>
            </div>
          </Card>

          {/* Personal Details */}
          <Card className="bg-muted/30 p-5">
            <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Birthdate</p>
                <p className="font-medium">{formValues.profileBirthdate || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">{formValues.profileAge ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Place of Birth</p>
                <p className="font-medium">{formValues.profilePlaceOfBirth || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sex</p>
                <p className="font-medium">{formValues.profileSex || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Height (cm)</p>
                <p className="font-medium">{formValues.profileHeight ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Civil Status</p>
                <p className="font-medium">{formValues.profileCivilStatus || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Religion</p>
                <p className="font-medium">{formValues.profileReligion || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Languages</p>
                <p className="font-medium">{formatLanguages()}</p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="bg-muted/30 p-5">
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{formValues.profileEmail || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact Number</p>
                <p className="font-medium">{formValues.profileContact || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Facebook</p>
                <p className="font-medium truncate">{formValues.profileFacebook || "—"}</p>
              </div>
            </div>
          </Card>

          {/* Disability */}
          {(formValues.profileDisability || formValues.profilePwdId) && (
            <Card className="bg-muted/30 p-5">
              <h3 className="text-sm font-semibold mb-3">Disability Information</h3>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Disability</p>
                  <p className="font-medium">{formValues.profileDisability || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PWD ID</p>
                  <p className="font-medium">{formValues.profilePwdId || "—"}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("form")}
            disabled={isPending}
          >
            Back to Edit
          </Button>
          <Button
            type="button"
            onClick={handleReviewConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Confirm & Save"
            )}
          </Button>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Profile Information?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure all the information you provided is correct? You can
                update your profile later through the SPES application form.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSave} disabled={isPending}>
                {isPending ? "Saving..." : "Yes, Save Profile"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
};

export default ProfileSetup;
