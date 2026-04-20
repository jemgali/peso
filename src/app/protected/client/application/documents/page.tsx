import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared"
import { requireUser } from "@/lib/utils/user-auth"
import { prisma } from "@/lib/prisma"

const LONG_BOND_DOCS = [
  { file: "dole-spes-checklist.docx", label: "DOLE SPES Checklist" },
  { file: "dole-spes-registration.docx", label: "DOLE SPES Registration" },
]

const A4_DOCS = [
  { file: "dole-spes-application.docx", label: "DOLE SPES Application" },
  { file: "dole-spes-contract.docx", label: "DOLE SPES Contract" },
  { file: "dole-spes-oath.docx", label: "DOLE SPES Oath" },
]

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

  const renderDocList = (items: Array<{ file: string; label: string }>) => (
    <div className="space-y-3">
      {items.map((doc) => (
        <div key={doc.file} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="font-medium">{doc.label}</p>
            <p className="text-xs text-muted-foreground">{doc.file}</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/form-layouts/${doc.file}`} target="_blank" rel="noopener noreferrer">
              View / Print
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents Printing"
        description="Download and print your required DOLE SPES forms"
      />

      <Card>
        <CardHeader>
          <CardTitle>Long Bond Paper (21.59cm x 33.02cm / 8.5&quot; x 13&quot;)</CardTitle>
        </CardHeader>
        <CardContent>{renderDocList(LONG_BOND_DOCS)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A4 Paper (21cm x 29.7cm / 8.27&quot; x 11.69&quot;)</CardTitle>
        </CardHeader>
        <CardContent>{renderDocList(A4_DOCS)}</CardContent>
      </Card>
    </div>
  )
}
