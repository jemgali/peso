"use client"

import React from "react"
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
import { useFormSubmit } from "@/hooks"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  announcement?: ScheduleEventData
  onAnnouncementCreated?: (announcement: ScheduleEventData) => void
  onAnnouncementUpdated?: (announcement: ScheduleEventData) => void
}

interface AnnouncementResponse {
  event: ScheduleEventData
}

function parseEventDates(event: ScheduleEventData): ScheduleEventData {
  return {
    ...event,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : null,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  }
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  mode,
  announcement,
  onAnnouncementCreated,
  onAnnouncementUpdated,
}: AnnouncementDialogProps) {
  const isEditMode = mode === "edit"

  const { submit: createSubmit, isPending: isCreatePending } = useFormSubmit<
    CreateScheduleEventFormValues,
    AnnouncementResponse
  >({
    url: "/api/admin/schedule",
    method: "POST",
    onSuccess: (result) => {
      toast.success("Announcement created successfully")
      onAnnouncementCreated?.(parseEventDates(result.event))
    },
    onError: (error) => {
      toast.error(error.message)
    },
    errorMessage: "Failed to create announcement",
  })

  const { submit: updateSubmit, isPending: isUpdatePending } = useFormSubmit<
    CreateScheduleEventFormValues,
    AnnouncementResponse
  >({
    url: `/api/admin/schedule/${announcement?.id}`,
    method: "PATCH",
    onSuccess: (result) => {
      toast.success("Announcement updated successfully")
      onAnnouncementUpdated?.(parseEventDates(result.event))
    },
    onError: (error) => {
      toast.error(error.message)
    },
    errorMessage: "Failed to update announcement",
  })

  const isPending = isEditMode ? isUpdatePending : isCreatePending

  const handleSubmit = async (data: CreateScheduleEventFormValues) => {
    const announcementData = { ...data, type: "announcement" as const }

    if (isEditMode && announcement) {
      await updateSubmit(announcementData)
    } else {
      await createSubmit(announcementData)
    }
  }

  const getDefaultValues = () => {
    if (mode === "edit" && announcement) {
      return {
        title: announcement.title,
        description: announcement.description || "",
        type: "announcement" as const,
        visibility: (announcement.visibility || "all") as "all" | "clients" | "employees",
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        allDay: announcement.allDay,
      }
    }
    return {
      type: "announcement" as const,
      visibility: "all" as const,
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
