"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Spinner } from "@/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog"
import {
  type ScheduleEventData,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  type EventType,
} from "@/lib/validations/schedule-event"
import { cn } from "@/lib/utils"
import { useFormSubmit } from "@/hooks"

interface EventDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ScheduleEventData
  onEdit: () => void
  onDelete: (eventId: string) => void
}

function formatDateTime(date: Date, allDay: boolean) {
  if (allDay) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { submit: submitDelete, isPending: isDeleting } = useFormSubmit<
    Record<string, never>,
    unknown
  >({
    url: `/api/admin/schedule/${event.id}`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("Event deleted successfully")
      setDeleteDialogOpen(false)
      onDelete(event.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = async () => {
    await submitDelete({})
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge
                  className={cn(
                    "mb-2 text-white",
                    EVENT_TYPE_COLORS[event.type as EventType]
                  )}
                >
                  {EVENT_TYPE_LABELS[event.type as EventType]}
                </Badge>
                <DialogTitle className="text-xl">{event.title}</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">
                  {formatDateTime(event.startDate, event.allDay)}
                </div>
                {event.endDate && (
                  <div className="text-sm text-muted-foreground">
                    to {formatDateTime(event.endDate, event.allDay)}
                  </div>
                )}
              </div>
            </div>

            {event.allDay && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">All day event</span>
              </div>
            )}

            {event.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
