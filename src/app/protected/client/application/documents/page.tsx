import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared"
import { requireUser } from "@/lib/utils/user-auth"
import { prisma } from "@/lib/prisma"

import GranteeView from "@/components/client/grantee-view"

export default async function DocumentsPrintingPage() {
  const user = await requireUser()

  const profile = await prisma.profileUser.findUnique({
    where: { userId: user.id },
    select: {
      profileId: true,
      submissions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: {
          status: true,
          spesWorkflow: {
            select: {
              selectionStatus: true,
            },
          },
        },
      },
    },
  })

  const latestSubmission = profile?.submissions[0]
  const isEligible = latestSubmission?.spesWorkflow?.selectionStatus === "GRANTEE"

  if (!isEligible) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Documents Printing"
          description="Available only for selected SPES grantees"
        />
        <Card>
          <CardContent className="py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              {latestSubmission?.status === "approved"
                ? "Your application is approved, but printable forms are released only after you are selected as an SPES grantee."
                : "Your printable DOLE documents will appear here after grantee selection in the SPES workflow."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/protected/client/application/status">View Application Status</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SPES Grantee Portal"
        description="Complete your final steps: Batch selection and document printing"
      />

      <GranteeView />
    </div>
  )
}
