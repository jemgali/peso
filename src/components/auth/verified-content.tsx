import React from 'react'
import Link from 'next/link'
import { Button } from '@/ui/button'
import { CheckCircle2 } from 'lucide-react'

const VerifiedContent = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center w-full max-w-sm mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background p-8 rounded-2xl shadow-2xl">
      
      {/* Success Icon */}
      <div className="h-24 w-24 bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-2">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      {/* Text Content */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Email Verified!
        </h1>
        <p className="text-muted-foreground text-sm">
          Thank you for confirming your email address. Your account has been successfully activated and you are ready to explore the PESO portal.
        </p>
      </div>

      {/* Call to Action */}
      <Button asChild className="w-full mt-4" size="lg">
        <Link href="/auth/sign-in">
          Continue to Sign In
        </Link>
      </Button>

    </div>
  )
}

export default VerifiedContent