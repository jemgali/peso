import { z } from "zod"

export const createProgramSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  image: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  link: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  order: z.number().int().min(0),
})

export const updateProgramSchema = createProgramSchema.partial().extend({
  id: z.string().min(1, "Program ID is required."),
})

export type CreateProgramFormValues = z.infer<typeof createProgramSchema>
export type UpdateProgramFormValues = z.infer<typeof updateProgramSchema>

export type ProgramData = {
  id: string
  title: string
  description: string | null
  image: string | null
  link: string | null
  status: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export type ProgramStatus = "active" | "inactive"
