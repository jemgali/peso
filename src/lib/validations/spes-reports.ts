import { z } from "zod"
import { APPLICATION_STATUSES, type ApplicantType, type ApplicationStatus } from "@/lib/validations/application-review"
import {
  EXAM_RESULTS,
  SPES_APPLICANT_CATEGORIES,
  SPES_SELECTION_STATUSES,
  SPES_WORKFLOW_STAGES,
  type ExamResult,
  type SpesApplicantCategory,
  type SpesSelectionStatus,
  type SpesWorkflowStage,
} from "@/lib/validations/spes-workflow"

export const REPORT_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export const SPES_REPORT_MIN_YEAR = 2020
export const SPES_REPORT_MAX_YEAR = 2099

export const listSpesReportsQuerySchema = z.object({
  year: z.coerce.number().int().min(SPES_REPORT_MIN_YEAR).max(SPES_REPORT_MAX_YEAR).optional(),
})

export type ListSpesReportsQuery = z.infer<typeof listSpesReportsQuerySchema>

export const exportSpesReportsSchema = z.object({
  year: z.coerce.number().int().min(SPES_REPORT_MIN_YEAR).max(SPES_REPORT_MAX_YEAR).optional(),
  spreadsheetId: z.string().trim().min(1).optional(),
  createNew: z.boolean().optional(),
})

export type ExportSpesReportsInput = z.infer<typeof exportSpesReportsSchema>

export interface MetricCount<TLabel extends string> {
  label: TLabel
  count: number
}

export interface MonthlyApplicationTrendItem {
  month: (typeof REPORT_MONTH_LABELS)[number]
  total: number
  approved: number
  rejected: number
  needsRevision: number
}

export interface SpesReportSummary {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  needsRevisionApplications: number
  rejectedApplications: number
  totalWorkflows: number
  granteeCount: number
  waitlistedCount: number
  deniedCount: number
  assignedOfficeCount: number
  activeBatchCount: number
  averageGranteeScore: number | null
}

export interface TraitAverageItem {
  trait:
    | "punctuality"
    | "respect"
    | "honesty"
    | "adaptability"
    | "expression"
    | "initiative"
    | "following"
    | "efficiency"
    | "creativity"
  label: string
  average: number
}

export interface RecentApplicationItem {
  submissionId: string
  applicantName: string
  applicantType: ApplicantType
  status: ApplicationStatus
  submittedAt: string
}

export interface TopGranteeScoreItem {
  recordId: string
  workflowId: string
  applicantName: string
  averageScore: number
  assignedOffice: string | null
  batchName: string | null
  ratedBy: string
  createdAt: string
}

export interface SpesReportsData {
  selectedYear: number
  availableYears: number[]
  generatedAt: string
  summary: SpesReportSummary
  monthlyApplicationTrend: MonthlyApplicationTrendItem[]
  applicationStatusCounts: MetricCount<ApplicationStatus>[]
  applicantCategoryCounts: MetricCount<SpesApplicantCategory>[]
  workflowSelectionStatusCounts: MetricCount<SpesSelectionStatus>[]
  workflowStageCounts: MetricCount<SpesWorkflowStage>[]
  workflowExamResultCounts: MetricCount<ExamResult>[]
  officeAssignmentCounts: MetricCount<string>[]
  batchAssignmentCounts: MetricCount<string>[]
  averageTraitScores: TraitAverageItem[]
  recentApplications: RecentApplicationItem[]
  topGranteeScores: TopGranteeScoreItem[]
}

export interface SpesReportsResponse {
  success: boolean
  data?: SpesReportsData
  error?: string
}

export interface ExportSpesReportsResponse {
  success: boolean
  data?: {
    spreadsheetId: string
    sheetTitle: string
    updatedCells: number
    report: SpesReportsData
  }
  error?: string
}

export const DEFAULT_APPLICATION_STATUS_COUNTS: MetricCount<ApplicationStatus>[] = APPLICATION_STATUSES.map(
  (status) => ({
    label: status,
    count: 0,
  })
)

export const DEFAULT_APPLICANT_CATEGORY_COUNTS: MetricCount<SpesApplicantCategory>[] = SPES_APPLICANT_CATEGORIES.map(
  (category) => ({
    label: category,
    count: 0,
  })
)

export const DEFAULT_WORKFLOW_SELECTION_COUNTS: MetricCount<SpesSelectionStatus>[] = SPES_SELECTION_STATUSES.map(
  (status) => ({
    label: status,
    count: 0,
  })
)

export const DEFAULT_WORKFLOW_STAGE_COUNTS: MetricCount<SpesWorkflowStage>[] = SPES_WORKFLOW_STAGES.map((stage) => ({
  label: stage,
  count: 0,
}))

export const DEFAULT_WORKFLOW_EXAM_RESULT_COUNTS: MetricCount<ExamResult>[] = EXAM_RESULTS.map((result) => ({
  label: result,
  count: 0,
}))
