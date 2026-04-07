"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/ui/button"
import { Mail, RefreshCw } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Spinner } from "@/ui/spinner"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await authClient.sendVerificationEmail({
        email: "", // Will use current session email
        callbackURL: "/auth/verified",
      })
      toast.success("Verification email sent! Please check your inbox.")
    } catch {
      toast.error("Failed to resend verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center w-full max-w-sm mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background p-8 rounded-2xl shadow-2xl">
      
      {/* Mail Icon */}
      <div className="h-24 w-24 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-2">
        <Mail className="h-12 w-12" />
      </div>
      
      {/* Text Content */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 pt-4">
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleResendEmail}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
        
        <Button asChild variant="ghost" className="w-full" size="lg">
          <Link href="/auth/sign-in">
            Back to Sign In
          </Link>
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground pt-2">
        Didn&apos;t receive the email? Check your spam folder or try resending.
      </p>
    </div>
  )
}
