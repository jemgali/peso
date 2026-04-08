"use client"

import React from "react"
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
import { useFormSubmit } from "@/hooks"

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
  const { submit, isPending } = useFormSubmit<Record<string, never>, void>({
    url: `/api/admin/schedule/${announcement.id}`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("Announcement deleted successfully")
      onAnnouncementDeleted(announcement.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    errorMessage: "Failed to delete announcement",
  })

  const handleDelete = () => {
    submit({})
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
