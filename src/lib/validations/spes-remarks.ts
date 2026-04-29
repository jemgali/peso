import { z } from "zod"

export const submitRemarkSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
  punctuality: z.number().int().min(1).max(5),
  respect: z.number().int().min(1).max(5),
  honesty: z.number().int().min(1).max(5),
  adaptability: z.number().int().min(1).max(5),
  expression: z.number().int().min(1).max(5),
  initiative: z.number().int().min(1).max(5),
  following: z.number().int().min(1).max(5),
  efficiency: z.number().int().min(1).max(5),
  creativity: z.number().int().min(1).max(5),
  remarks: z.string().max(2000).optional().nullable(),
  ratedBy: z.string().min(1, "Rater name is required").max(120),
  documentUrl: z.string().url("Invalid document URL").optional().nullable(),
})

export type SubmitRemarkInput = z.infer<typeof submitRemarkSchema>

export interface GranteeRemarkItem {
  recordId: string
  workflowId: string
  applicationYear: number | null
  assignedOffice: string | null
  punctuality: number
  respect: number
  honesty: number
  adaptability: number
  expression: number
  initiative: number
  following: number
  efficiency: number
  creativity: number
  remarks: string | null
  ratedBy: string
  documentUrl: string | null
  createdAt: string
}

export interface SpesGranteeWithRemarks {
  workflowId: string
  applicantName: string
  records: GranteeRemarkItem[]
}

export interface GranteeRemarksListResponse {
  success: boolean
  data?: {
    grantees: SpesGranteeWithRemarks[]
  }
  error?: string
}

export interface SubmitRemarkResponse {
  success: boolean
  data?: {
    record: GranteeRemarkItem
  }
  error?: string
}
