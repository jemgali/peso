import type {
  Prisma,
  SpesExamResult as PrismaExamResult,
  SpesPriorityLevel as PrismaPriorityLevel,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type {
  ApplicantPriority,
  ExamResult,
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

export function toWorkflowListItem(workflow: WorkflowWithRelations): SpesWorkflowListItem {
  const firstName = workflow.submission.profile.profileFirstName?.trim() || ""
  const lastName = workflow.submission.profile.profileLastName?.trim() || ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()

  return {
    workflowId: workflow.workflowId,
    submissionId: workflow.submissionId,
    submissionNumber: workflow.submission.submissionNumber,
    applicantName: fullName || "Unnamed applicant",
    stage: toApiStage(workflow.stage),
    priority: toApiPriority(workflow.priority),
    examScore: workflow.examScore,
    examResult: toApiExamResult(workflow.examResult),
    rankPosition: workflow.rankPosition,
    isWaitlisted: workflow.isWaitlisted,
    isGrantee: workflow.isGrantee,
    batchId: workflow.batch?.batchId || null,
    batchName: workflow.batch?.batchName || null,
    assignedOffice: workflow.assignedOffice,
    updatedAt: workflow.updatedAt.toISOString(),
  }
}

export async function ensureApprovedSpesWorkflows(): Promise<void> {
  const approvedSubmissions = await prisma.applicationSubmission.findMany({
    where: { status: "approved" },
    select: { submissionId: true },
  })

  if (approvedSubmissions.length === 0) {
    return
  }

  const approvedIds = approvedSubmissions.map((submission) => submission.submissionId)

  const existingWorkflows = await prisma.spesWorkflow.findMany({
    where: {
      submissionId: {
        in: approvedIds,
      },
    },
    select: {
      submissionId: true,
    },
  })

  const existingIdSet = new Set(existingWorkflows.map((workflow) => workflow.submissionId))
  const missingIds = approvedIds.filter((id) => !existingIdSet.has(id))

  if (missingIds.length === 0) {
    return
  }

  await prisma.spesWorkflow.createMany({
    data: missingIds.map((submissionId) => ({
      workflowId: crypto.randomUUID(),
      submissionId,
    })),
    skipDuplicates: true,
  })
}
