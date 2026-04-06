import { z } from "zod"

export const createUserSchema = z.object({
  lastName: z.string().min(1, "Last name is required."),
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["employee", "client"], "Please select a role."),
})

export const updateUserSchema = z.object({
  lastName: z.string().min(1, "Last name is required."),
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .optional()
    .or(z.literal("")),
  role: z.enum(["employee", "client"], "Please select a role."),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>

export type UserData = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  createdAt: Date
}
