"use client";

import React, { useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/shared";
import BasicInfoSection from "@/components/forms/client/sections/basic-info-section";
import { profileSetupSchema, type ProfileSetupFormValues } from "@/lib/validations/profile-setup";
import { toUppercaseValues } from "@/lib/utils";
import { UserCircle, Save } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema) as Resolver<ProfileSetupFormValues>,
    mode: "onChange",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/client/profile-setup");
        const result = await response.json();
        if (result.success) {
          reset(result.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setSaving(true);
    try {
      const payload = toUppercaseValues(data);
      const response = await fetch("/api/client/profile-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full py-4">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information and contact details"
      />

      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCircle className="size-6" />
            </div>
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                These details are used for your SPES and other program applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <BasicInfoSection
              register={register as any}
              errors={errors as any}
              isPending={saving}
              watch={watch as any}
              setValue={setValue as any}
              control={control as any}
              disableEmail
            />

            <div className="flex justify-end pt-6 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm sm:static sm:bg-transparent">
              <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto px-8">
                {saving ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" className="size-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
