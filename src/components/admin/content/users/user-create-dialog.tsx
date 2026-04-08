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
import { UserForm } from "@/forms/admin/user-form"
import { useFormSubmit } from "@/hooks"
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
  const { submit, isPending } = useFormSubmit<
    CreateUserFormValues,
    { user: UserData }
  >({
    url: "/api/admin/users",
    method: "POST",
    onSuccess: (result) => {
      toast.success("User created successfully")
      onUserCreated(result.user)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = async (data: CreateUserFormValues) => {
    await submit(data)
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
