import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared"

export default function GIPApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="GIP Application Form"
        description="Government Internship Program application workspace"
      />
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            GIP application workflow is not yet available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

