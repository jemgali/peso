import React from "react"
import ServiceSelectionContent from "@/components/admin/service-selection-content"
import { PageHeader } from "@/components/shared"

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programs"
        description="Select which program/service to manage"
      />
      <ServiceSelectionContent />
    </div>
  )
}

export default Page
