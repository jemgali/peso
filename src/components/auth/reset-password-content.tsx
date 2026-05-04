"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ResetPasswordForm from "@/components/forms/auth/reset-password-form"

const ResetPasswordContent = () => {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim() || ""

  return (
    <section className="flex w-full items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden border-0 shadow-lg md:border">
        <div className="flex flex-col md:flex-row">
          <aside className="flex w-full flex-col items-center justify-center bg-muted/30 p-8 md:w-5/12">
            <div className="relative mb-6 size-32">
              <Image
                src="/assets/peso_logo.png"
                alt="PESO Logo"
                fill
                className="object-contain drop-shadow-sm"
                sizes="128px"
                priority
              />
            </div>
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                Verify Reset Code
              </h2>
              <CardDescription className="text-balance">
                Enter the 8-character code from your email and set a new password.
              </CardDescription>
            </div>
          </aside>
          <Separator orientation="vertical" className="hidden md:block" />
          <main className="flex w-full flex-col justify-center gap-4 bg-background p-6 md:w-7/12 md:p-8 lg:p-12">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                {email
                  ? `Code sent to ${email}`
                  : "Your reset code is required before setting a new password."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {email ? (
                <ResetPasswordForm email={email} />
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Missing email context. Request a new reset code first.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/auth/forgot-password">Go to Forgot Password</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </main>
        </div>
      </Card>
    </section>
  )
}

export default ResetPasswordContent
