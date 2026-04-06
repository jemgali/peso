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
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (data: CreateProgramFormValues) => {
    setIsPending(true)
    try {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create program")
      }

      const { program } = await response.json()
      toast.success("Program created successfully")
      onProgramCreated(program)
    } catch (error) {
      console.error("Error creating program:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create program")
    } finally {
      setIsPending(false)
    }
  }

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
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel="Create Program"
        />
      </DialogContent>
    </Dialog>
  )
}
