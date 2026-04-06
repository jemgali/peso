"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createProgramSchema,
  type CreateProgramFormValues,
} from "@/lib/validations/program"
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

interface ProgramFormProps {
  defaultValues?: Partial<CreateProgramFormValues>
  onSubmit: (data: CreateProgramFormValues) => Promise<void>
  isPending: boolean
  submitLabel?: string
}

export function ProgramForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: ProgramFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProgramFormValues>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      link: "",
      status: "active" as const,
      order: 0,
      ...defaultValues,
    },
  })

  const status = watch("status")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Title *</FieldLabel>
            <Input
              {...register("title")}
              id="title"
              placeholder="e.g., Special Programs for Employment of Students"
              disabled={isPending}
              aria-invalid={!!errors.title}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              {...register("description")}
              id="description"
              placeholder="Brief description of the program..."
              disabled={isPending}
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.image}>
            <FieldLabel htmlFor="image">Image URL</FieldLabel>
            <Input
              {...register("image")}
              id="image"
              type="url"
              placeholder="https://example.com/image.png"
              disabled={isPending}
              aria-invalid={!!errors.image}
            />
            {errors.image && <FieldError>{errors.image.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.link}>
            <FieldLabel htmlFor="link">Program Link</FieldLabel>
            <Input
              {...register("link")}
              id="link"
              type="url"
              placeholder="https://example.com/program"
              disabled={isPending}
              aria-invalid={!!errors.link}
            />
            {errors.link && <FieldError>{errors.link.message}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as "active" | "inactive")}
                disabled={isPending}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <FieldError>{errors.status.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.order}>
              <FieldLabel htmlFor="order">Display Order</FieldLabel>
              <Input
                {...register("order", { valueAsNumber: true })}
                id="order"
                type="number"
                min={0}
                disabled={isPending}
                aria-invalid={!!errors.order}
              />
              {errors.order && <FieldError>{errors.order.message}</FieldError>}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
