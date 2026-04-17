import React from "react"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminServiceLabel, ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"

const Page = async () => {
  const cookieStore = await cookies()
  const selectedService = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value

  if (!isAdminService(selectedService)) {
    return null
  }

  const isSpes = selectedService === "spes"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Active workspace: {getAdminServiceLabel(selectedService)}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isSpes ? "SPES Workspace Ready" : "Under Construction"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isSpes
              ? "Use the sidebar to manage applications, evaluation, scheduling, and batches."
              : `${getAdminServiceLabel(selectedService)} admin workflow is not implemented yet.`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page
