"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { TextField } from "@/components/shared"
import { FieldGroup, FieldSet } from "@/ui/field"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{8}$/, "Enter the 8-character code from your email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  email: string
}

const ResetPasswordForm = ({ email }: ResetPasswordFormProps) => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await authClient.emailOtp.resetPassword(
      {
        email,
        otp: data.otp.toUpperCase(),
        password: data.password,
      },
      {
        onRequest: () => {
          setIsPending(true)
        },
        onSuccess: () => {
          toast.success("Password updated. You can now sign in.")
          setIsPending(false)
          router.push("/auth/sign-in")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Invalid code or reset failed.")
          setIsPending(false)
        },
      }
    )
  }

  const handleResendCode = async () => {
    await authClient.emailOtp.requestPasswordReset(
      {
        email,
      },
      {
        onRequest: () => {
          setIsResending(true)
        },
        onSuccess: () => {
          toast.success("A new reset code has been sent to your email.")
          setIsResending(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to resend reset code.")
          setIsResending(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <FieldGroup>
        <FieldSet className="gap-4">
          <TextField
            name="otp"
            label="Verification Code"
            register={register}
            error={errors.otp?.message}
            disabled={isPending}
            placeholder="ABC12345"
            className="w-full uppercase"
            maxLength={8}
            onChange={(event) => {
              event.target.value = event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 8)
            }}
          />
          <TextField
            name="password"
            label="New Password"
            type="password"
            register={register}
            error={errors.password?.message}
            disabled={isPending}
            className="w-full"
          />
          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            register={register}
            error={errors.confirmPassword?.message}
            disabled={isPending}
            className="w-full"
          />
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Updating password..." : "Verify code and reset password"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending || isResending}
            onClick={handleResendCode}
          >
            {isResending && <Spinner data-icon="inline-start" />}
            {isResending ? "Sending new code..." : "Resend code"}
          </Button>
        </FieldSet>
      </FieldGroup>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/auth/forgot-password" className="font-semibold text-primary underline-offset-4 hover:underline">
          Use a different email
        </Link>
      </div>
    </form>
  )
}

export default ResetPasswordForm
