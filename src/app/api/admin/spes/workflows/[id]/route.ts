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
import {
  updateWorkflowSchema,
  type UpdateWorkflowResponse,
} from "@/lib/validations/spes-workflow"
import {
  computeWorkflowRankMap,
  getPassingScore,
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

async function recalculateRankPositions(tx: Prisma.TransactionClient): Promise<void> {
  const workflows = await tx.spesWorkflow.findMany({
    select: {
      workflowId: true,
      examScore: true,
    },
  })

  const rankMap = computeWorkflowRankMap(workflows)

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
  })

  if (!existingWorkflow) {
    return NextResponse.json(
      { success: false, error: "Workflow not found" },
      { status: 404 }
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

  const nextSelectionStatus = deriveSelectionStatus(
    existingWorkflow.selectionStatus,
    nextExamResult,
    parsed.data.selectionStatus
  )
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

  const updatedWorkflow = await prisma.$transaction(async (tx) => {
    await tx.spesWorkflow.update({
      where: { workflowId },
      data: updateData,
    })

    if (parsed.data.examScore !== undefined) {
      await recalculateRankPositions(tx)
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

  return NextResponse.json({
    success: true,
    data: {
      workflow: toWorkflowListItem(updatedWorkflow),
    },
  })
}
