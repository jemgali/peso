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
  const { submit, isPending } = useFormSubmit<void, void>({
    url: `/api/admin/programs/${program.id}`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("Program deleted successfully")
      onProgramDeleted(program.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    submit(undefined as void)
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
