import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Calendar, Layers } from "lucide-react"

interface StatsCardsProps {
  totalApplications: number
  pendingReviews: number
  upcomingEvents: number
  activeBatches: number
}

export function StatsCards({
  totalApplications,
  pendingReviews,
  upcomingEvents,
  activeBatches,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Users,
      description: "Total SPES applicants",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Reviews",
      value: pendingReviews,
      icon: FileText,
      description: "Awaiting admin action",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents,
      icon: Calendar,
      description: "Next 7 days",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Active Batches",
      value: activeBatches,
      icon: Layers,
      description: "Current deployments",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
