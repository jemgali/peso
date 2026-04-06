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
import { UserForm } from "@/forms/admin/user-form"
import type { CreateUserFormValues, UserData } from "@/lib/validations/user"

type UserCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: (user: UserData) => void
}

export function UserCreateDialog({
  open,
  onOpenChange,
  onUserCreated,
}: UserCreateDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (data: CreateUserFormValues) => {
    setIsPending(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user")
      }

      toast.success("User created successfully")
      onUserCreated(result.user)
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new employee or client user account.
          </DialogDescription>
        </DialogHeader>
        <UserForm mode="create" onSubmit={handleSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}
