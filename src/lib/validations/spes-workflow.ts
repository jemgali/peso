import { z } from "zod"

export const APPLICANT_PRIORITIES = ["high", "moderate", "low"] as const
export type ApplicantPriority = (typeof APPLICANT_PRIORITIES)[number]

export const SPES_WORKFLOW_STAGES = [
  "application_approved",
  "interview_scheduled",
  "priority_assigned",
  "exam_scheduled",
  "exam_evaluated",
  "qualified",
  "waitlisted",
  "grantee_selected",
  "documents_released",
  "orientation_scheduled",
  "batch_assigned",
  "office_assigned",
] as const
export type SpesWorkflowStage = (typeof SPES_WORKFLOW_STAGES)[number]

export const EXAM_RESULTS = ["pending", "passed", "failed"] as const
export type ExamResult = (typeof EXAM_RESULTS)[number]

export const SPES_SELECTION_STATUSES = [
  "pending",
  "waitlisted",
  "grantee",
  "denied",
] as const
export type SpesSelectionStatus = (typeof SPES_SELECTION_STATUSES)[number]

export const MUTABLE_SELECTION_STATUSES = [
  "pending",
  "waitlisted",
  "grantee",
] as const
export type MutableSpesSelectionStatus = (typeof MUTABLE_SELECTION_STATUSES)[number]

export const examSettingsSchema = z.object({
  totalScore: z.number().int().min(1, "Total score must be at least 1"),
  passingThresholdPercent: z
    .number()
    .int()
    .min(1, "Passing threshold must be at least 1%")
    .max(100, "Passing threshold cannot exceed 100%"),
})

export type ExamSettings = z.infer<typeof examSettingsSchema>

export const updateExamSettingsSchema = z.object({
  totalScore: z.coerce.number().int().min(1, "Total score must be at least 1"),
  passingThresholdPercent: z.coerce
    .number()
    .int()
    .min(1, "Passing threshold must be at least 1%")
    .max(100, "Passing threshold cannot exceed 100%"),
})

export const createBatchSchema = z.object({
  batchName: z
    .string()
    .min(1, "Batch name is required")
    .max(120, "Batch name is too long"),
  startDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid start date",
  }),
})

export type CreateBatchInput = z.infer<typeof createBatchSchema>

export const updateWorkflowSchema = z.object({
  stage: z.enum(SPES_WORKFLOW_STAGES).optional(),
  priority: z.enum(APPLICANT_PRIORITIES).nullable().optional(),
  examScore: z.coerce.number().min(0, "Exam score cannot be negative").nullable().optional(),
  selectionStatus: z.enum(MUTABLE_SELECTION_STATUSES).optional(),
  batchId: z.string().min(1).nullable().optional(),
  assignedOffice: z
    .string()
    .trim()
    .max(160, "Assigned office is too long")
    .nullable()
    .optional(),
  note: z.string().trim().max(500, "Note is too long").optional(),
})

export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>

export const assignWorkflowSchema = z
  .object({
    batchId: z.string().trim().min(1, "Batch ID is required").nullable().optional(),
    assignedOffice: z
      .string()
      .trim()
      .min(1, "Assigned office is required")
      .max(160, "Assigned office is too long")
      .nullable()
      .optional(),
    note: z.string().trim().max(500, "Note is too long").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.batchId === undefined && value.assignedOffice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: "Provide batchId and/or assignedOffice for assignment updates",
      })
    }
  })

export type AssignWorkflowInput = z.infer<typeof assignWorkflowSchema>

export const listWorkflowsQuerySchema = z.object({
  search: z.string().trim().max(120, "Search text is too long").optional(),
  status: z.enum(SPES_SELECTION_STATUSES).optional(),
})
export type ListWorkflowsQueryInput = z.infer<typeof listWorkflowsQuerySchema>

export const bulkNotifyWorkflowsSchema = z.object({
  workflowIds: z.array(z.string().min(1, "Workflow ID is required")).min(1, "Select at least one applicant"),
  note: z.string().trim().max(500, "Note is too long").optional(),
})
export type BulkNotifyWorkflowsInput = z.infer<typeof bulkNotifyWorkflowsSchema>

export const bulkUpdateWorkflowStatusSchema = z.object({
  workflowIds: z.array(z.string().min(1, "Workflow ID is required")).min(1, "Select at least one applicant"),
  selectionStatus: z.enum(MUTABLE_SELECTION_STATUSES),
  note: z.string().trim().max(500, "Note is too long").optional(),
})
export type BulkUpdateWorkflowStatusInput = z.infer<typeof bulkUpdateWorkflowStatusSchema>

export const bulkAssignWorkflowsSchema = z
  .object({
    workflowIds: z.array(z.string().min(1, "Workflow ID is required")).min(1, "Select at least one applicant"),
    batchId: z.string().trim().min(1, "Batch ID is required").nullable().optional(),
    assignedOffice: z
      .string()
      .trim()
      .min(1, "Assigned office is required")
      .max(160, "Assigned office is too long")
      .optional(),
    note: z.string().trim().max(500, "Note is too long").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.batchId === undefined && value.assignedOffice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: "Provide batchId and/or assignedOffice for bulk assignment updates",
      })
    }
  })
export type BulkAssignWorkflowsInput = z.infer<typeof bulkAssignWorkflowsSchema>

export const WORKFLOW_SCHEDULE_STAGE_TYPES = [
  "interview",
  "exam",
  "orientation",
] as const
export type WorkflowScheduleStageType = (typeof WORKFLOW_SCHEDULE_STAGE_TYPES)[number]

export interface ExamSettingsResponse {
  success: boolean
  data?: {
    totalScore: number
    passingThresholdPercent: number
    passingScore: number
  }
  error?: string
}

export interface BatchListItem {
  batchId: string
  batchName: string
  startDate: string
  officeName: string | null
  granteeCount: number
  createdAt: string
}

export interface BatchListResponse {
  success: boolean
  data?: {
    batches: BatchListItem[]
  }
  error?: string
}

export interface CreateBatchResponse {
  success: boolean
  data?: {
    batch: BatchListItem
  }
  error?: string
}

export interface SpesWorkflowListItem {
  workflowId: string
  submissionId: string
  applicantName: string
  stage: SpesWorkflowStage
  priority: ApplicantPriority | null
  examScore: number | null
  examResult: ExamResult
  rankPosition: number | null
  selectionStatus: SpesSelectionStatus
  batchId: string | null
  batchName: string | null
  assignedOffice: string | null
  updatedAt: string
}

export interface SpesWorkflowListResponse {
  success: boolean
  data?: {
    workflows: SpesWorkflowListItem[]
  }
  error?: string
}

export interface UpdateWorkflowResponse {
  success: boolean
  data?: {
    workflow: SpesWorkflowListItem
  }
  error?: string
}

export interface WorkflowAssignmentResponse {
  success: boolean
  data?: {
    workflow: SpesWorkflowListItem
    assignment: {
      batchChanged: boolean
      officeChanged: boolean
      stageChanged: boolean
      stage: SpesWorkflowStage
    }
    notifications: {
      batch: boolean
      office: boolean
    }
  }
  error?: string
}

export interface WorkflowScheduleResponse {
  success: boolean
  data?: {
    workflowId: string
    submissionId: string
    stage: SpesWorkflowStage
    stageType: WorkflowScheduleStageType
    scheduleEvent: {
      id: string
      title: string
      description: string | null
      type: string
      visibility: string
      startDate: string
      endDate: string | null
      allDay: boolean
    }
    notification: {
      title: string
      message: string
      type: string
      link: string
    }
    wasUpdated: boolean
  }
  error?: string
}

export interface BulkNotifyWorkflowsResponse {
  success: boolean
  data?: {
    requested: number
    notified: number
    emailSent: number
    emailFailed: number
    missingWorkflowIds: string[]
  }
  error?: string
}

export interface BulkUpdateWorkflowStatusResponse {
  success: boolean
  data?: {
    requested: number
    updated: number
    autoDenied: number
    missingWorkflowIds: string[]
  }
  error?: string
}

export interface BulkAssignWorkflowsResponse {
  success: boolean
  data?: {
    requested: number
    updated: number
    missingWorkflowIds: string[]
  }
  error?: string
}
