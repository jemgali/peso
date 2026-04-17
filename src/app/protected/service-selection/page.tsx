import React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/utils/admin-auth"
import ServiceSelectionContent from "@/components/admin/service-selection-content"
import { PageHeader } from "@/components/shared"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"

export default async function ServiceSelectionPage() {
  await requireAdmin()

  const cookieStore = await cookies()
  const selectedService = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value

  if (isAdminService(selectedService)) {
    redirect("/protected/admin")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Workspace"
        description="Select which program/service to manage"
      />
      <ServiceSelectionContent />
    </div>
  )
}

