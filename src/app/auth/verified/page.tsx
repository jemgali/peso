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

  if (isVerified) {
     redirect("/protected")
  }

  return (
    <VerifiedContent />
  )
}

export default Page