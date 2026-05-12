import React from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"
import { prisma } from "@/lib/prisma"
import { StatsCards } from "@/components/admin/dashboard/stats-cards"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { ArrowRight, LayoutDashboard } from "lucide-react"

const Page = async () => {
  const cookieStore = await cookies()
  const selectedServiceValue = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value
  const selectedService = isAdminService(selectedServiceValue)
    ? selectedServiceValue
    : null

  // Fetch Stats
  const [
    totalApplications,
    pendingReviews,
    upcomingEvents,
    activeBatches,
    recentActivities,
  ] = await Promise.all([
    prisma.applicationSubmission.count(),
    prisma.applicationSubmission.count({ where: { status: "pending" } }),
    prisma.scheduleEvent.count({
      where: {
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.spesBatch.count({
      where: {
        startDate: {
          lte: new Date(),
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
  ])

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening across your programs.
          </p>
        </div>
        {!selectedService && (
          <Button asChild variant="outline">
            <Link href="/protected/admin/programs">
              Select Program <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        )}
      </div>

      <StatsCards
        totalApplications={totalApplications}
        pendingReviews={pendingReviews}
        upcomingEvents={upcomingEvents}
        activeBatches={activeBatches}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <RecentActivity activities={recentActivities} />
        
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Program Management</CardTitle>
            <CardDescription>Quick access to your active workspaces</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedService ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <LayoutDashboard className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold">SPES Workspace</p>
                    <p className="text-sm text-muted-foreground">Currently active workspace</p>
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link href="/protected/admin/applications">
                    Enter Workspace
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  No active workspace selected. Choose a program to start managing.
                </p>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/protected/admin/programs">
                    Browse Programs
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="mb-3 text-sm font-medium">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" className="justify-start text-xs" asChild>
                  <Link href="/protected/admin/audit">Audit Logs</Link>
                </Button>
                <Button variant="ghost" className="justify-start text-xs" asChild>
                  <Link href="/protected/admin/users">User Management</Link>
                </Button>
                <Button variant="ghost" className="justify-start text-xs" asChild>
                  <Link href="/protected/admin/reports">System Reports</Link>
                </Button>
                <Button variant="ghost" className="justify-start text-xs" asChild>
                  <Link href="/protected/admin/schedule">Main Calendar</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Page
