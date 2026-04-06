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
import { ProgramForm } from "@/components/forms/admin/program-form"
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
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (data: CreateProgramFormValues) => {
    setIsPending(true)
    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update program")
      }

      const { program: updatedProgram } = await response.json()
      toast.success("Program updated successfully")
      onProgramUpdated(updatedProgram)
    } catch (error) {
      console.error("Error updating program:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update program")
    } finally {
      setIsPending(false)
    }
  }

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
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel="Update Program"
        />
      </DialogContent>
    </Dialog>
  )
}
