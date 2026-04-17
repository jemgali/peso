import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared"

export default function DILPApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="DILP Application Form"
        description="DOLE Integrated Livelihood Program application workspace"
      />
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            DILP application workflow is not yet available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

