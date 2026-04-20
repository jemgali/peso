import React from "react"
import { requireSpesService } from "@/lib/utils/admin-service-auth"

export default async function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSpesService()
  return <>{children}</>
}

