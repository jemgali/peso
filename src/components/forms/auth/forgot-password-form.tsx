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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordForm = () => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await authClient.emailOtp.requestPasswordReset(
      {
        email: data.email,
      },
      {
        onRequest: () => {
          setIsPending(true)
        },
        onSuccess: () => {
          toast.success("If the account exists, we sent an 8-character reset code.")
          setIsPending(false)
          router.push(`/auth/forgot-password/verify?email=${encodeURIComponent(data.email)}`)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to send reset code.")
          setIsPending(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <FieldGroup>
        <FieldSet className="gap-4">
          <TextField
            name="email"
            label="Email"
            type="email"
            register={register}
            error={errors.email?.message}
            disabled={isPending}
            placeholder="user@example.com"
            className="w-full"
          />
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Sending code..." : "Send reset code"}
          </Button>
        </FieldSet>
      </FieldGroup>

      <div className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-primary underline-offset-4 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
