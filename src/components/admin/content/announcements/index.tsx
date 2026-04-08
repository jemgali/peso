"use client"

import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Plus, Search, Calendar, Clock, Bell } from "lucide-react"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { AnnouncementsListSkeleton } from "@/ui/skeletons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { AnnouncementDialog } from "./announcement-dialog"
import { AnnouncementDeleteDialog } from "./announcement-delete-dialog"
import {
  type ScheduleEventData,
  EVENT_TYPE_COLORS,
  type EventType,
} from "@/lib/validations/schedule-event"
import { cn } from "@/lib/utils"
import { useDialogState } from "@/hooks"

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<ScheduleEventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const {
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    selectedItem,
    openCreate,
    openEdit,
    openDelete,
  } = useDialogState<ScheduleEventData>()

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/admin/schedule?type=announcement")
      if (!response.ok) {
        throw new Error("Failed to fetch announcements")
      }
      const data = await response.json()
      setAnnouncements(data.events.map((e: ScheduleEventData) => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })))
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast.error("Failed to load announcements")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements

    const query = searchQuery.toLowerCase()
    return announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(query) ||
        (announcement.description && announcement.description.toLowerCase().includes(query))
    )
  }, [announcements, searchQuery])

  const handleAnnouncementCreated = (newAnnouncement: ScheduleEventData) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ))
    setCreateOpen(false)
  }

  const handleAnnouncementUpdated = (updatedAnnouncement: ScheduleEventData) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === updatedAnnouncement.id ? updatedAnnouncement : a))
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    )
    setEditOpen(false)
  }

  const handleAnnouncementDeleted = (deletedId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId))
    setDeleteOpen(false)
  }

  const formatDate = (date: Date, allDay: boolean) => {
    if (allDay) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const isUpcoming = (date: Date) => {
    return date >= new Date()
  }

  const isPast = (date: Date) => {
    return date < new Date()
  }

  if (isLoading) {
    return <AnnouncementsListSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-muted-foreground">
            Manage announcements that appear on the schedule calendar.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Announcement
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? "No announcements found matching your search." : "No announcements yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first announcement to get started.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              New Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                isPast(announcement.startDate) && "opacity-60"
              )}
              onClick={() => openEdit(announcement)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={cn(
                      "text-white shrink-0",
                      EVENT_TYPE_COLORS[announcement.type as EventType]
                    )}
                  >
                    {isUpcoming(announcement.startDate) ? "Upcoming" : "Past"}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{announcement.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {announcement.description && (
                  <CardDescription className="line-clamp-2 mb-3">
                    {announcement.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(announcement.startDate, announcement.allDay)}</span>
                  </div>
                  {announcement.allDay && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>All day</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDelete(announcement)
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(announcement)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onAnnouncementCreated={handleAnnouncementCreated}
      />

      {selectedItem && (
        <>
          <AnnouncementDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            mode="edit"
            announcement={selectedItem}
            onAnnouncementUpdated={handleAnnouncementUpdated}
          />
          <AnnouncementDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            announcement={selectedItem}
            onAnnouncementDeleted={handleAnnouncementDeleted}
          />
        </>
      )}
    </div>
  )
}
