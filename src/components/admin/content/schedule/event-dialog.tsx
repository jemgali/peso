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

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  event?: ScheduleEventData
  defaultDate?: Date
  onEventCreated?: (event: ScheduleEventData) => void
  onEventUpdated?: (event: ScheduleEventData) => void
}

interface EventApiResponse {
  event: ScheduleEventData
}

function parseEventDates(eventData: ScheduleEventData): ScheduleEventData {
  return {
    ...eventData,
    startDate: new Date(eventData.startDate),
    endDate: eventData.endDate ? new Date(eventData.endDate) : null,
    createdAt: new Date(eventData.createdAt),
    updatedAt: new Date(eventData.updatedAt),
  }
}

export function EventDialog({
  open,
  onOpenChange,
  mode,
  event,
  defaultDate,
  onEventCreated,
  onEventUpdated,
}: EventDialogProps) {
  const isEditMode = mode === "edit"

  const { submit: submitCreate, isPending: isCreating } = useFormSubmit<
    CreateScheduleEventFormValues,
    EventApiResponse
  >({
    url: "/api/admin/schedule",
    method: "POST",
    onSuccess: (result) => {
      toast.success("Event created successfully")
      onEventCreated?.(parseEventDates(result.event))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { submit: submitUpdate, isPending: isUpdating } = useFormSubmit<
    CreateScheduleEventFormValues,
    EventApiResponse
  >({
    url: `/api/admin/schedule/${event?.id}`,
    method: "PATCH",
    onSuccess: (result) => {
      toast.success("Event updated successfully")
      onEventUpdated?.(parseEventDates(result.event))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = async (data: CreateScheduleEventFormValues) => {
    if (isEditMode && event) {
      await submitUpdate(data)
    } else {
      await submitCreate(data)
    }
  }

  const isPending = isCreating || isUpdating

  const getDefaultValues = () => {
    if (mode === "edit" && event) {
      return {
        title: event.title,
        description: event.description || "",
        type: event.type as "announcement" | "schedule" | "deadline",
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
      }
    }
    return {
      startDate: defaultDate || new Date(),
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Event" : "Edit Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new event to the schedule."
              : `Update the details for "${event?.title}".`}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel={mode === "create" ? "Create Event" : "Update Event"}
        />
      </DialogContent>
    </Dialog>
  )
}
