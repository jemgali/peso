"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/lib/validations/user"

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
            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                {...register("lastName")}
                type="text"
                id="lastName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="eg. Dela Cruz"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <FieldError>{errors.lastName.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                {...register("firstName")}
                type="text"
                id="firstName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="eg. Juan"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <FieldError>{errors.firstName.message}</FieldError>
              )}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field data-invalid={!!errors.middleName}>
              <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
              <Input
                {...register("middleName")}
                type="text"
                id="middleName"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="eg. Antonio"
                aria-invalid={!!errors.middleName}
              />
              {errors.middleName && (
                <FieldError>{errors.middleName.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.suffix}>
              <FieldLabel htmlFor="suffix">Suffix</FieldLabel>
              <Input
                {...register("suffix")}
                type="text"
                id="suffix"
                disabled={isPending}
                autoCapitalize="words"
                placeholder="eg. Jr"
                aria-invalid={!!errors.suffix}
              />
              {errors.suffix && (
                <FieldError>{errors.suffix.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>

        <FieldSet className="gap-3">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              {...register("email")}
              type="email"
              id="email"
              disabled={isPending}
              placeholder="user@example.com"
              className="w-full"
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">
              Password {mode === "edit" && "(leave blank to keep current)"}
            </FieldLabel>
            <Input
              {...register("password")}
              type="password"
              id="password"
              disabled={isPending}
              className="w-full"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Select
              value={selectedRole}
              onValueChange={(value: "employee" | "client") =>
                setValue("role", value, { shouldValidate: true })
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full" id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <FieldError>{errors.role.message}</FieldError>}
          </Field>
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
