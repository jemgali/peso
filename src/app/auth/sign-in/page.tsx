import React from 'react'
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SignInContent from '@/components/auth/sign-in-content'
import { auth } from "@/lib/auth"

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    if (session.user.emailVerified) {
      redirect("/protected")
    }

    redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`)
  }

  return <SignInContent />
}

export default Page
