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
import { useFormSubmit } from "@/hooks"
import type { UserData } from "@/lib/validations/user"

type UserArchiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData
  onUserArchived: (user: UserData) => void
}

export function UserArchiveDialog({
  open,
  onOpenChange,
  user,
  onUserArchived,
}: UserArchiveDialogProps) {
  const { submit, isPending } = useFormSubmit<
    Record<string, never>,
    { user: UserData }
  >({
    url: `/api/admin/users/${user.id}`,
    method: "DELETE",
    onSuccess: (result) => {
      toast.success("User archived successfully")
      onUserArchived(result.user)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleArchive = () => {
    submit({})
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive <strong>{user.name}</strong>? This
            user will no longer be able to access the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={isPending}
            variant="destructive"
          >
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Archiving...
              </>
            ) : (
              "Archive"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
