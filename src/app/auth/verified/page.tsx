import React from 'react'
import VerifiedContent from '@/components/auth/verified-content'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user?.emailVerified) {
    redirect("/protected")
  }

  return (
    <VerifiedContent />
  )
}

export default Page