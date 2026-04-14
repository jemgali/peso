import { z } from "zod"

export const eventTypeSchema = z.enum(["announcement", "schedule", "deadline"])
export const eventVisibilitySchema = z.enum(["all", "clients", "employees"])

export const createScheduleEventSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  type: eventTypeSchema,
  visibility: eventVisibilitySchema,
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  allDay: z.boolean(),
})

export const updateScheduleEventSchema = createScheduleEventSchema.partial().extend({
  id: z.string().min(1, "Event ID is required."),
})

export type CreateScheduleEventFormValues = z.infer<typeof createScheduleEventSchema>
export type UpdateScheduleEventFormValues = z.infer<typeof updateScheduleEventSchema>

export type ScheduleEventData = {
  id: string
  title: string
  description: string | null
  type: string
  visibility: string
  startDate: Date
  endDate: Date | null
  allDay: boolean
  createdAt: Date
  updatedAt: Date
}

export type EventType = "announcement" | "schedule" | "deadline"
export type EventVisibility = "all" | "clients" | "employees"

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  announcement: "Announcement",
  schedule: "Schedule",
  deadline: "Deadline",
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  announcement: "bg-blue-500",
  schedule: "bg-green-500",
  deadline: "bg-red-500",
}
