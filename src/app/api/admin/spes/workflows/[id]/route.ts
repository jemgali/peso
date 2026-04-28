import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesExamResult as PrismaExamResult,
  SpesSelectionStatus as PrismaSelectionStatus,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEvaluationBulkNotifyEmail } from "@/lib/email"
import {
  updateWorkflowSchema,
  type UpdateWorkflowResponse,
} from "@/lib/validations/spes-workflow"
import {
  computeWorkflowRankMap,
  getPassingScore,
  toApiApplicantCategory,
  toDbPriority,
  toDbSelectionStatus,
  toDbStage,
  toWorkflowListItem,
} from "@/lib/utils/spes-workflow"

interface RouteParams {
  params: Promise<{ id: string }>
}

const SETTINGS_SCOPE = "spes"

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return session.user.id
}

function deriveSelectionStatus(
  existingStatus: PrismaSelectionStatus,
  nextExamResult: PrismaExamResult,
  requestedStatus: ReturnType<typeof updateWorkflowSchema.parse>["selectionStatus"]
): PrismaSelectionStatus {
  if (nextExamResult === "FAILED") {
    return "DENIED"
  }

  if (requestedStatus) {
    return toDbSelectionStatus(requestedStatus)
  }

  if (existingStatus === "DENIED") {
    return "PENDING"
  }

  return existingStatus
}

function getDerivedStage(
  currentStage: PrismaWorkflowStage,
  payload: ReturnType<typeof updateWorkflowSchema.parse>,
  nextSelectionStatus: PrismaSelectionStatus
): PrismaWorkflowStage {
  if (payload.stage) {
    return toDbStage(payload.stage)
  }

  if (payload.assignedOffice !== undefined && payload.assignedOffice) {
    return "OFFICE_ASSIGNED"
  }

  if (payload.batchId !== undefined && payload.batchId) {
    return "BATCH_ASSIGNED"
  }

  if (nextSelectionStatus === "GRANTEE") {
    return "GRANTEE_SELECTED"
  }

  if (nextSelectionStatus === "WAITLISTED") {
    return "WAITLISTED"
  }

  if (payload.examScore !== undefined) {
    return "EXAM_EVALUATED"
  }

  if (payload.priority !== undefined && payload.priority !== null) {
    return "PRIORITY_ASSIGNED"
  }

  return currentStage
}

async function recalculateRankPositions(
  tx: Prisma.TransactionClient,
  totalScore: number
): Promise<void> {
  const workflows = await tx.spesWorkflow.findMany({
    select: {
      workflowId: true,
      examScore: true,
      priority: true,
      submission: {
        select: {
          applicantType: true,
        },
      },
    },
  })

  const rankMap = computeWorkflowRankMap(
    workflows.map((workflow) => ({
      workflowId: workflow.workflowId,
      applicantCategory: toApiApplicantCategory(workflow.submission.applicantType),
      examScore: workflow.examScore,
      priority: workflow.priority,
    })),
    { totalScore }
  )

  await Promise.all(
    workflows.map((workflow) =>
      tx.spesWorkflow.update({
        where: { workflowId: workflow.workflowId },
        data: {
          rankPosition: rankMap.get(workflow.workflowId) ?? null,
        },
      })
    )
  )
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<UpdateWorkflowResponse>> {
  const adminUserId = await getAdminUserId()
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const { id: workflowId } = await params
  const payload = await request.json().catch(() => null)
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  const parsed = updateWorkflowSchema.safeParse(payload)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || "Invalid workflow payload" },
      { status: 400 }
    )
  }

  const existingWorkflow = await prisma.spesWorkflow.findUnique({
    where: { workflowId },
    include: {
      submission: {
        select: {
          applicantType: true,
          profileId: true,
          profile: {
            select: {
              userId: true,
              profileFirstName: true,
              profileLastName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!existingWorkflow) {
    return NextResponse.json(
      { success: false, error: "Workflow not found" },
      { status: 404 }
    )
  }

  const isSpesBaby = existingWorkflow.submission.applicantType === "SPES_BABY"
  const hasInterviewExamRelatedUpdates =
    parsed.data.priority !== undefined ||
    parsed.data.examScore !== undefined ||
    parsed.data.stage === "interview_scheduled" ||
    parsed.data.stage === "priority_assigned" ||
    parsed.data.stage === "exam_scheduled" ||
    parsed.data.stage === "exam_evaluated"

  if (isSpesBaby && hasInterviewExamRelatedUpdates) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Interview/exam/priority fields are not applicable to SPES Baby applicants",
      },
      { status: 400 }
    )
  }

  if (parsed.data.batchId) {
    const batchExists = await prisma.spesBatch.findUnique({
      where: { batchId: parsed.data.batchId },
      select: { batchId: true },
    })

    if (!batchExists) {
      return NextResponse.json(
        { success: false, error: "Selected batch does not exist" },
        { status: 400 }
      )
    }
  }

  const settings = await prisma.spesExamSettings.upsert({
    where: { scope: SETTINGS_SCOPE },
    update: {},
    create: {
      settingsId: crypto.randomUUID(),
      scope: SETTINGS_SCOPE,
      totalScore: 100,
      passingThresholdPercent: 75,
      updatedById: adminUserId,
    },
  })

  const passingScore = getPassingScore(
    settings.totalScore,
    settings.passingThresholdPercent
  )

  const updateData: Prisma.SpesWorkflowUncheckedUpdateInput = {}
  let nextExamResult: PrismaExamResult = existingWorkflow.examResult

  if (parsed.data.priority !== undefined) {
    updateData.priority = parsed.data.priority
      ? toDbPriority(parsed.data.priority)
      : null
  }

    if (parsed.data.examScore !== undefined) {
      updateData.examScore = parsed.data.examScore
    if (parsed.data.examScore === null) {
      nextExamResult = "PENDING"
    } else {
      nextExamResult = parsed.data.examScore >= passingScore ? "PASSED" : "FAILED"
    }
    updateData.examResult = nextExamResult
  }

  if (parsed.data.batchId !== undefined) {
    updateData.batchId = parsed.data.batchId
  }

  if (parsed.data.assignedOffice !== undefined) {
    updateData.assignedOffice = parsed.data.assignedOffice?.trim() || null
  }
  const nextRemarksValue =
    parsed.data.remarks !== undefined ? parsed.data.remarks?.trim() || null : undefined

  const nextSelectionStatus = deriveSelectionStatus(
    existingWorkflow.selectionStatus,
    nextExamResult,
    parsed.data.selectionStatus
  )
  const becameGrantee =
    existingWorkflow.selectionStatus !== "GRANTEE" &&
    nextSelectionStatus === "GRANTEE"
  updateData.selectionStatus = nextSelectionStatus

  if (nextSelectionStatus === "GRANTEE") {
    updateData.selectedById = adminUserId
    updateData.selectedAt = existingWorkflow.selectedAt || new Date()
  } else {
    updateData.selectedById = null
    updateData.selectedAt = null
  }

  const derivedStage = getDerivedStage(existingWorkflow.stage, parsed.data, nextSelectionStatus)
  if (derivedStage !== existingWorkflow.stage) {
    updateData.stage = derivedStage
  }
  const hasWorkflowUpdates = Object.keys(updateData).length > 0

  const updatedWorkflow = await prisma.$transaction(async (tx) => {
    if (hasWorkflowUpdates) {
      await tx.spesWorkflow.update({
        where: { workflowId },
        data: updateData,
      })
    }

    if (parsed.data.examScore !== undefined || parsed.data.priority !== undefined) {
      await recalculateRankPositions(tx, settings.totalScore)
    }

    if (nextRemarksValue !== undefined) {
      await tx.profileSPES.upsert({
        where: { profileId: existingWorkflow.submission.profileId },
        update: {
          remarks: nextRemarksValue,
        },
        create: {
          spesId: crypto.randomUUID(),
          profileId: existingWorkflow.submission.profileId,
          remarks: nextRemarksValue,
        },
      })
    }

    if (becameGrantee) {
      await tx.notification.create({
        data: {
          notificationId: crypto.randomUUID(),
          userId: existingWorkflow.submission.profile.userId,
          type: "application_approved",
          title: "SPES Grantee Selected",
          message:
            "Congratulations! You have been selected as an SPES grantee. Please check your application status for next steps.",
          link: "/protected/client/application/status",
        },
      })
    }

    const workflow = await tx.spesWorkflow.findUnique({
      where: { workflowId },
      include: {
        submission: {
          include: {
            profile: {
              select: {
                profileFirstName: true,
                profileLastName: true,
                spes: {
                  select: {
                    remarks: true,
                  },
                },
              },
            },
          },
        },
        batch: {
          select: {
            batchId: true,
            batchName: true,
          },
        },
      },
    })

    if (!workflow) {
      throw new Error("Workflow not found after update")
    }

    if (workflow.stage !== existingWorkflow.stage) {
      await tx.spesStageHistory.create({
        data: {
          historyId: crypto.randomUUID(),
          workflowId: workflow.workflowId,
          stage: workflow.stage,
          note: parsed.data.note || null,
          createdById: adminUserId,
        },
      })
    }

    return workflow
  })

  if (becameGrantee) {
    const applicantName = [
      existingWorkflow.submission.profile.profileFirstName?.trim() || "",
      existingWorkflow.submission.profile.profileLastName?.trim() || "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Applicant"

    sendEvaluationBulkNotifyEmail({
      to: existingWorkflow.submission.profile.user.email,
      applicantName,
      note: "Congratulations! You were selected as an SPES grantee.",
    }).catch((error) => {
      console.error("Failed to send grantee email notification:", error)
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      workflow: toWorkflowListItem(updatedWorkflow),
    },
  })
}
