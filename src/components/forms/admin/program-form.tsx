"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createProgramSchema,
  type CreateProgramFormValues,
} from "@/lib/validations/program"
import { FieldSet, FieldGroup } from "@/ui/field"
import { TextField, TextareaField, SelectField } from "@/components/shared"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

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
          <TextField
            name="title"
            label="Title"
            register={register}
            error={errors.title?.message}
            disabled={isPending}
            placeholder="e.g., Special Programs for Employment of Students"
            required
          />

          <TextareaField
            name="description"
            label="Description"
            register={register}
            error={errors.description?.message}
            disabled={isPending}
            placeholder="Brief description of the program..."
            rows={3}
          />

          <TextField
            name="image"
            label="Image URL"
            register={register}
            error={errors.image?.message}
            disabled={isPending}
            type="url"
            placeholder="https://example.com/image.png"
          />

          <TextField
            name="link"
            label="Program Link"
            register={register}
            error={errors.link?.message}
            disabled={isPending}
            type="url"
            placeholder="https://example.com/program"
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              name="status"
              label="Status"
              value={status}
              onValueChange={(value) => setValue("status", value as "active" | "inactive")}
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              disabled={isPending}
              placeholder="Select status"
            />

            <TextField
              name="order"
              label="Display Order"
              register={register}
              error={errors.order?.message}
              disabled={isPending}
              type="number"
              registerOptions={{ valueAsNumber: true }}
            />
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
