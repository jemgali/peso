"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { EventForm } from "@/components/forms/admin/event-form"
import {
  type CreateScheduleEventFormValues,
  type ScheduleEventData,
} from "@/lib/validations/schedule-event"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  announcement?: ScheduleEventData
  onAnnouncementCreated?: (announcement: ScheduleEventData) => void
  onAnnouncementUpdated?: (announcement: ScheduleEventData) => void
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  mode,
  announcement,
  onAnnouncementCreated,
  onAnnouncementUpdated,
}: AnnouncementDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (data: CreateScheduleEventFormValues) => {
    // Ensure type is always "announcement"
    const announcementData = { ...data, type: "announcement" as const }
    
    setIsPending(true)
    try {
      if (mode === "create") {
        const response = await fetch("/api/admin/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(announcementData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create announcement")
        }

        const { event } = await response.json()
        const parsedEvent = {
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }
        toast.success("Announcement created successfully")
        onAnnouncementCreated?.(parsedEvent)
      } else if (announcement) {
        const response = await fetch(`/api/admin/schedule/${announcement.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(announcementData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update announcement")
        }

        const { event } = await response.json()
        const parsedEvent = {
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }
        toast.success("Announcement updated successfully")
        onAnnouncementUpdated?.(parsedEvent)
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} announcement:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} announcement`)
    } finally {
      setIsPending(false)
    }
  }

  const getDefaultValues = () => {
    if (mode === "edit" && announcement) {
      return {
        title: announcement.title,
        description: announcement.description || "",
        type: "announcement" as const,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        allDay: announcement.allDay,
      }
    }
    return {
      type: "announcement" as const,
      startDate: new Date(),
      allDay: true, // Announcements are typically all-day events
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Announcement" : "Edit Announcement"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new announcement. It will appear on the schedule calendar."
              : `Update the details for "${announcement?.title}".`}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel={mode === "create" ? "Create Announcement" : "Update Announcement"}
        />
      </DialogContent>
    </Dialog>
  )
}
