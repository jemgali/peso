"use client"

import React, { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { UserForm } from "@/forms/admin/user-form"
import type { UpdateUserFormValues, UserData } from "@/lib/validations/user"

type UserEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData
  onUserUpdated: (user: UserData) => void
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: UserEditDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const defaultValues = useMemo(() => {
    const nameParts = user.name.split(" ")
    let lastName = ""
    let firstName = ""
    let middleName = ""
    let suffix = ""

    const suffixes = ["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]

    if (nameParts.length >= 2) {
      const lastPart = nameParts[nameParts.length - 1].toLowerCase()
      if (suffixes.includes(lastPart)) {
        suffix = nameParts.pop() || ""
      }
    }

    if (nameParts.length >= 1) {
      firstName = nameParts[0] || ""
    }
    if (nameParts.length >= 2) {
      lastName = nameParts[nameParts.length - 1] || ""
    }
    if (nameParts.length >= 3) {
      middleName = nameParts.slice(1, -1).join(" ")
    }

    return {
      lastName,
      firstName,
      middleName,
      suffix,
      email: user.email,
      role: (user.role as "employee" | "client") || undefined,
    }
  }, [user])

  const handleSubmit = async (data: UpdateUserFormValues) => {
    setIsPending(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user")
      }

      toast.success("User updated successfully")
      onUserUpdated(result.user)
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Leave password blank to keep the current
            password.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
