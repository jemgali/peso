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

interface ProgramEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: ProgramData
  onProgramUpdated: (program: ProgramData) => void
}

export function ProgramEditDialog({
  open,
  onOpenChange,
  program,
  onProgramUpdated,
}: ProgramEditDialogProps) {
  const { submit, isPending } = useFormSubmit<CreateProgramFormValues, { program: ProgramData }>({
    url: `/api/admin/programs/${program.id}`,
    method: "PATCH",
    onSuccess: (result) => {
      toast.success("Program updated successfully")
      onProgramUpdated(result.program)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{program.title}&quot;.
          </DialogDescription>
        </DialogHeader>
        <ProgramForm
          defaultValues={{
            title: program.title,
            description: program.description || "",
            image: program.image || "",
            link: program.link || "",
            status: program.status as "active" | "inactive",
            order: program.order,
          }}
          onSubmit={async (data) => { await submit(data) }}
          isPending={isPending}
          submitLabel="Update Program"
        />
      </DialogContent>
    </Dialog>
  )
}
