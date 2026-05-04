import React from 'react'
import VerifiedContent from '@/components/auth/verified-content'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If user is already verified and has a session, they can go straight to protected
  let isVerified = session?.user?.emailVerified;
  
  // Ground Truth Check: If session says false, check the database directly
  if (session?.user && !isVerified) {
    const { prisma } = await import('@/lib/prisma');
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true }
    });
    
    if (dbUser?.emailVerified) {
      isVerified = true;
    }
  }

  // If verified (either via session or direct DB check), show success
  if (isVerified) {
    return <VerifiedContent />;
  }

  // Fallback: if somehow they got here but aren't verified in either session or DB
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Verification Pending</h1>
        <p className="text-muted-foreground">
          We couldn't confirm your verification status. If you just clicked the link, please try refreshing.
        </p>
        <a href="/auth/sign-in" className="inline-block text-primary hover:underline">
          Back to Sign In
        </a>
      </div>
    </div>
  );
}

export default Page