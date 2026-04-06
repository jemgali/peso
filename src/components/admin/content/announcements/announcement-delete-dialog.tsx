"use client"

import React, { useState } from "react"
import { toast } from "sonner"
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
import { Spinner } from "@/ui/spinner"
import { type ScheduleEventData } from "@/lib/validations/schedule-event"

interface AnnouncementDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: ScheduleEventData
  onAnnouncementDeleted: (announcementId: string) => void
}

export function AnnouncementDeleteDialog({
  open,
  onOpenChange,
  announcement,
  onAnnouncementDeleted,
}: AnnouncementDeleteDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const response = await fetch(`/api/admin/schedule/${announcement.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete announcement")
      }

      toast.success("Announcement deleted successfully")
      onAnnouncementDeleted(announcement.id)
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete announcement")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{announcement.title}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
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
  )
}
