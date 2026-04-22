import type {
  ApplicationApplicantType as PrismaApplicantType,
  Prisma,
  SpesExamResult as PrismaExamResult,
  SpesPriorityLevel as PrismaPriorityLevel,
  SpesSelectionStatus as PrismaSelectionStatus,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import type {
  ApplicantPriority,
  ExamResult,
  SpesApplicantCategory,
  SpesSelectionStatus,
  SpesWorkflowListItem,
  SpesWorkflowStage,
} from "@/lib/validations/spes-workflow"

export function toApiStage(stage: PrismaWorkflowStage): SpesWorkflowStage {
  return stage.toLowerCase() as SpesWorkflowStage
}

export function toDbStage(stage: SpesWorkflowStage): PrismaWorkflowStage {
  return stage.toUpperCase() as PrismaWorkflowStage
}

export function toApiPriority(priority: PrismaPriorityLevel | null): ApplicantPriority | null {
  if (!priority) return null
  return priority.toLowerCase() as ApplicantPriority
}

export function toDbPriority(priority: ApplicantPriority): PrismaPriorityLevel {
  return priority.toUpperCase() as PrismaPriorityLevel
}

export function toApiExamResult(result: PrismaExamResult): ExamResult {
  return result.toLowerCase() as ExamResult
}

export function toApiSelectionStatus(status: PrismaSelectionStatus): SpesSelectionStatus {
  return status.toLowerCase() as SpesSelectionStatus
}

export function toApiApplicantCategory(applicantType: PrismaApplicantType): SpesApplicantCategory {
  return applicantType === "SPES_BABY" ? "spes_baby" : "new"
}

export function toDbSelectionStatus(status: SpesSelectionStatus): PrismaSelectionStatus {
  return status.toUpperCase() as PrismaSelectionStatus
}

export function getPassingScore(totalScore: number, thresholdPercent: number): number {
  return Math.ceil((totalScore * thresholdPercent) / 100)
}

type WorkflowWithRelations = Prisma.SpesWorkflowGetPayload<{
  include: {
    submission: {
      include: {
        profile: {
          select: {
            profileFirstName: true
            profileLastName: true
          }
        }
      }
    }
    batch: {
      select: {
        batchId: true
        batchName: true
      }
    }
  }
}>

export function computeWorkflowRankMap(
  workflows: Array<{ workflowId: string; examScore: number | null }>
): Map<string, number | null> {
  const rankedEntries = workflows
    .filter((workflow): workflow is { workflowId: string; examScore: number } => workflow.examScore !== null)
    .sort((a, b) => b.examScore - a.examScore)

  const rankMap = new Map<string, number | null>()
  let currentRank = 0
  let previousScore: number | null = null

  for (let index = 0; index < rankedEntries.length; index += 1) {
    const item = rankedEntries[index]
    if (previousScore === null || item.examScore !== previousScore) {
      currentRank = index + 1
      previousScore = item.examScore
    }
    rankMap.set(item.workflowId, currentRank)
  }

  for (const workflow of workflows) {
    if (!rankMap.has(workflow.workflowId)) {
      rankMap.set(workflow.workflowId, null)
    }
  }

  return rankMap
}

export function toWorkflowListItem(
  workflow: WorkflowWithRelations,
  options?: { rankPosition?: number | null }
): SpesWorkflowListItem {
  const firstName = workflow.submission.profile.profileFirstName?.trim() || ""
  const lastName = workflow.submission.profile.profileLastName?.trim() || ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()

  return {
    workflowId: workflow.workflowId,
    submissionId: workflow.submissionId,
    applicantName: fullName || "Unnamed applicant",
    applicantCategory: toApiApplicantCategory(workflow.submission.applicantType),
    stage: toApiStage(workflow.stage),
    priority: toApiPriority(workflow.priority),
    examScore: workflow.examScore,
    examResult: toApiExamResult(workflow.examResult),
    rankPosition: options?.rankPosition ?? workflow.rankPosition,
    selectionStatus: toApiSelectionStatus(workflow.selectionStatus),
    batchId: workflow.batch?.batchId || null,
    batchName: workflow.batch?.batchName || null,
    assignedOffice: workflow.assignedOffice,
    updatedAt: workflow.updatedAt.toISOString(),
  }
}
