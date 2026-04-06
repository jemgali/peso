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
  const [isPending, setIsPending] = useState(false)

  const handleArchive = async () => {
    setIsPending(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to archive user")
      }

      toast.success("User archived successfully")
      onUserArchived(result.user)
    } catch (error) {
      console.error("Error archiving user:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to archive user"
      )
    } finally {
      setIsPending(false)
    }
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
