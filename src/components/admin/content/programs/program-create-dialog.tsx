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
import { ProgramForm } from "@/components/forms/admin/program-form"
import { useFormSubmit } from "@/hooks"
import { type CreateProgramFormValues, type ProgramData } from "@/lib/validations/program"

interface ProgramCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProgramCreated: (program: ProgramData) => void
}

export function ProgramCreateDialog({
  open,
  onOpenChange,
  onProgramCreated,
}: ProgramCreateDialogProps) {
  const { submit, isPending } = useFormSubmit<CreateProgramFormValues, { program: ProgramData }>({
    url: "/api/admin/programs",
    method: "POST",
    onSuccess: (result) => {
      toast.success("Program created successfully")
      onProgramCreated(result.program)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>
            Create a new PESO program or service. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <ProgramForm
          onSubmit={async (data) => { await submit(data) }}
          isPending={isPending}
          submitLabel="Create Program"
        />
      </DialogContent>
    </Dialog>
  )
}
