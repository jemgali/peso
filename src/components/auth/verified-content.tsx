"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/button'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const VerifiedContent = () => {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // If we have a session and the user is verified, redirect to protected
    if (session?.user?.emailVerified) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/protected')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session, router])

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center w-full max-w-sm mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background p-8 rounded-2xl shadow-2xl border border-border">
      
      {/* Success Icon */}
      <div className="h-24 w-24 bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      {/* Text Content */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Email Verified!
        </h1>
        <p className="text-muted-foreground text-sm">
          Thank you for confirming your email address. Your account has been successfully activated.
        </p>
      </div>

      {/* Dynamic Action Section */}
      <div className="w-full pt-4">
        {isPending ? (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking session...</span>
          </div>
        ) : session?.user?.emailVerified ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Redirecting to dashboard in {countdown}s...
            </p>
            <Button asChild className="w-full group" size="lg">
              <Link href="/protected">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Verification complete. Please sign in to continue.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/sign-in">
                Back to Sign In
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground pt-2">
        Having trouble? Contact our support team.
      </p>
    </div>
  )
}

export default VerifiedContent
