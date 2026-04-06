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

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  event?: ScheduleEventData
  defaultDate?: Date
  onEventCreated?: (event: ScheduleEventData) => void
  onEventUpdated?: (event: ScheduleEventData) => void
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
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (data: CreateScheduleEventFormValues) => {
    setIsPending(true)
    try {
      if (mode === "create") {
        const response = await fetch("/api/admin/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create event")
        }

        const { event: newEvent } = await response.json()
        const parsedEvent = {
          ...newEvent,
          startDate: new Date(newEvent.startDate),
          endDate: newEvent.endDate ? new Date(newEvent.endDate) : null,
          createdAt: new Date(newEvent.createdAt),
          updatedAt: new Date(newEvent.updatedAt),
        }
        toast.success("Event created successfully")
        onEventCreated?.(parsedEvent)
      } else if (event) {
        const response = await fetch(`/api/admin/schedule/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update event")
        }

        const { event: updatedEvent } = await response.json()
        const parsedEvent = {
          ...updatedEvent,
          startDate: new Date(updatedEvent.startDate),
          endDate: updatedEvent.endDate ? new Date(updatedEvent.endDate) : null,
          createdAt: new Date(updatedEvent.createdAt),
          updatedAt: new Date(updatedEvent.updatedAt),
        }
        toast.success("Event updated successfully")
        onEventUpdated?.(parsedEvent)
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} event:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} event`)
    } finally {
      setIsPending(false)
    }
  }

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
