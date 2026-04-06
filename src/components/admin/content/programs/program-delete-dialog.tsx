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
import { type ProgramData } from "@/lib/validations/program"

interface ProgramDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: ProgramData
  onProgramDeleted: (programId: string) => void
}

export function ProgramDeleteDialog({
  open,
  onOpenChange,
  program,
  onProgramDeleted,
}: ProgramDeleteDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete program")
      }

      toast.success("Program deleted successfully")
      onProgramDeleted(program.id)
    } catch (error) {
      console.error("Error deleting program:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete program")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Program</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{program.title}&quot;? This action cannot be undone.
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
