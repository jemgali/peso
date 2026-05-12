import React from "react"
import ServiceSelectionContent from "@/components/admin/service-selection-content"
import { PageHeader } from "@/components/shared"
import { prisma } from "@/lib/prisma"

const Page = async () => {
  const programs = await prisma.program.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="PESO Programs"
        description="Select a program workspace to manage applications and operations"
      />
      <ServiceSelectionContent initialPrograms={programs} />
    </div>
  )
}

export default Page
