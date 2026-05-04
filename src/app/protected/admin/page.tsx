import React from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"

const Page = async () => {
  const cookieStore = await cookies()
  const selectedServiceValue = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value
  const selectedService = isAdminService(selectedServiceValue)
    ? selectedServiceValue
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {selectedService
            ? "Active workspace: SPES"
            : "No active workspace selected"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedService
              ? "SPES Workspace Ready"
              : "Select Program/Service"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedService ? (
            <p className="text-sm text-muted-foreground">
              Use the sidebar to manage applications, evaluation, scheduling, and batches.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Choose a program/service to unlock workspace-specific tools.
              </p>
              <div>
                <Button asChild size="sm">
                  <Link href="/protected/admin/programs">
                    Open Programs
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Page
