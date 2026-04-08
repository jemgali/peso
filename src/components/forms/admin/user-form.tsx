"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FieldSet, FieldGroup } from "@/ui/field"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"
import { TextField, SelectField } from "@/components/shared"
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/lib/validations/user"

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "client", label: "Client" },
]

type UserFormPropsCreate = {
  mode: "create"
  defaultValues?: undefined
  onSubmit: (data: CreateUserFormValues) => Promise<void>
  isPending: boolean
}

type UserFormPropsEdit = {
  mode: "edit"
  defaultValues: Partial<UpdateUserFormValues>
  onSubmit: (data: UpdateUserFormValues) => Promise<void>
  isPending: boolean
}

type UserFormProps = UserFormPropsCreate | UserFormPropsEdit

export function UserForm(props: UserFormProps) {
  const { mode, isPending } = props
  const defaultValues = props.mode === "edit" ? props.defaultValues : undefined
  const schema = mode === "create" ? createUserSchema : updateUserSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: defaultValues?.lastName || "",
      firstName: defaultValues?.firstName || "",
      middleName: defaultValues?.middleName || "",
      suffix: defaultValues?.suffix || "",
      email: defaultValues?.email || "",
      password: "",
      role: defaultValues?.role || undefined,
    },
  })

  const selectedRole = watch("role")

  const handleFormSubmit = (data: CreateUserFormValues | UpdateUserFormValues) => {
    if (props.mode === "create") {
      return props.onSubmit(data as CreateUserFormValues)
    }
    return props.onSubmit(data as UpdateUserFormValues)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full space-y-4">
      <FieldGroup>
        <FieldSet className="gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              name="lastName"
              label="Last Name"
              register={register}
              error={errors.lastName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="eg. Dela Cruz"
            />
            <TextField
              name="firstName"
              label="First Name"
              register={register}
              error={errors.firstName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="eg. Juan"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              name="middleName"
              label="Middle Name"
              register={register}
              error={errors.middleName?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="eg. Antonio"
            />
            <TextField
              name="suffix"
              label="Suffix"
              register={register}
              error={errors.suffix?.message}
              disabled={isPending}
              autoCapitalize="words"
              placeholder="eg. Jr"
            />
          </div>
        </FieldSet>

        <FieldSet className="gap-3">
          <TextField
            name="email"
            label="Email"
            type="email"
            register={register}
            error={errors.email?.message}
            disabled={isPending}
            placeholder="user@example.com"
            className="w-full"
          />
          <TextField
            name="password"
            label={
              mode === "edit"
                ? "Password (leave blank to keep current)"
                : "Password"
            }
            type="password"
            register={register}
            error={errors.password?.message}
            disabled={isPending}
            className="w-full"
          />
          <SelectField
            name="role"
            label="Role"
            value={selectedRole}
            onValueChange={(value) =>
              setValue("role", value as "employee" | "client", {
                shouldValidate: true,
              })
            }
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            disabled={isPending}
            placeholder="Select a role"
          />
        </FieldSet>

        <FieldSet className="pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : mode === "create" ? (
              "Create User"
            ) : (
              "Save Changes"
            )}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  )
}
