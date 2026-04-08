"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createScheduleEventSchema,
  type CreateScheduleEventFormValues,
} from "@/lib/validations/schedule-event"
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field"
import { Input } from "@/ui/input"
import { Checkbox } from "@/ui/checkbox"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"
import { TextField, TextareaField, SelectField } from "@/components/shared"

interface EventFormProps {
  defaultValues?: Partial<CreateScheduleEventFormValues>
  onSubmit: (data: CreateScheduleEventFormValues) => Promise<void>
  isPending: boolean
  submitLabel?: string
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function EventForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateScheduleEventFormValues>({
    resolver: zodResolver(createScheduleEventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "schedule" as const,
      startDate: new Date(),
      endDate: null,
      allDay: false,
      ...defaultValues,
    },
  })

  const type = watch("type")
  const allDay = watch("allDay")
  const startDate = watch("startDate")

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
            placeholder="Event title"
            required
          />

          <TextareaField
            name="description"
            label="Description"
            register={register}
            error={errors.description?.message}
            disabled={isPending}
            placeholder="Event description..."
            rows={3}
          />

          <SelectField
            name="type"
            label="Type"
            value={type}
            onValueChange={(value) => setValue("type", value as "announcement" | "schedule" | "deadline")}
            options={[
              { value: "announcement", label: "Announcement" },
              { value: "schedule", label: "Schedule" },
              { value: "deadline", label: "Deadline" },
            ]}
            error={errors.type?.message}
            disabled={isPending}
            placeholder="Select type"
            required
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setValue("allDay", checked === true)}
              disabled={isPending}
            />
            <label
              htmlFor="allDay"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All day event
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.startDate}>
              <FieldLabel htmlFor="startDate">
                {allDay ? "Start Date *" : "Start Date & Time *"}
              </FieldLabel>
              <Input
                type={allDay ? "date" : "datetime-local"}
                id="startDate"
                defaultValue={
                  startDate
                    ? allDay
                      ? formatDateLocal(new Date(startDate))
                      : formatDateTimeLocal(new Date(startDate))
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setValue("startDate", new Date(value))
                  }
                }}
                disabled={isPending}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.endDate}>
              <FieldLabel htmlFor="endDate">
                {allDay ? "End Date" : "End Date & Time"}
              </FieldLabel>
              <Input
                type={allDay ? "date" : "datetime-local"}
                id="endDate"
                defaultValue={
                  defaultValues?.endDate
                    ? allDay
                      ? formatDateLocal(new Date(defaultValues.endDate))
                      : formatDateTimeLocal(new Date(defaultValues.endDate))
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value
                  setValue("endDate", value ? new Date(value) : null)
                }}
                disabled={isPending}
                aria-invalid={!!errors.endDate}
              />
              {errors.endDate && <FieldError>{errors.endDate.message}</FieldError>}
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
