"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Calendar } from "lucide-react"
import type { ScheduleEventData } from "@/lib/validations/schedule-event"

export default function DashboardAnnouncements() {
  const [announcements, setAnnouncements] = useState<ScheduleEventData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/client/announcements")
        if (response.ok) {
          const data = await response.json()
          setAnnouncements(
            data.announcements.map((a: ScheduleEventData) => ({
              ...a,
              startDate: new Date(a.startDate),
              endDate: a.endDate ? new Date(a.endDate) : null,
              createdAt: new Date(a.createdAt),
              updatedAt: new Date(a.updatedAt),
            }))
          )
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isNew = (date: Date) => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return date >= threeDaysAgo
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No announcements at this time
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Announcements</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {announcements.map((announcement) => (
          <Card
            key={announcement.id}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm line-clamp-2">
                  {announcement.title}
                </CardTitle>
                {isNew(announcement.startDate) && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    New
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {announcement.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {announcement.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar />
                <span>{formatDate(announcement.startDate)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
