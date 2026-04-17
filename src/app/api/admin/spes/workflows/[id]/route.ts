import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesExamResult as PrismaExamResult,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  updateWorkflowSchema,
  type UpdateWorkflowResponse,
} from "@/lib/validations/spes-workflow"
import {
  getPassingScore,
  toDbPriority,
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

function getDerivedStage(
  currentStage: PrismaWorkflowStage,
  payload: ReturnType<typeof updateWorkflowSchema.parse>
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

  if (payload.isGrantee === true) {
    return "GRANTEE_SELECTED"
  }

  if (payload.isWaitlisted === true) {
    return "WAITLISTED"
  }

  if (payload.examScore !== undefined && payload.examScore !== null) {
    return "EXAM_EVALUATED"
  }

  if (payload.priority !== undefined && payload.priority !== null) {
    return "PRIORITY_ASSIGNED"
  }

  return currentStage
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

  if (parsed.data.rankPosition !== undefined) {
    updateData.rankPosition = parsed.data.rankPosition
  }

  if (parsed.data.isWaitlisted !== undefined) {
    updateData.isWaitlisted = parsed.data.isWaitlisted
  }

  if (parsed.data.batchId !== undefined) {
    updateData.batchId = parsed.data.batchId
  }

  if (parsed.data.assignedOffice !== undefined) {
    updateData.assignedOffice = parsed.data.assignedOffice?.trim() || null
  }

  if (parsed.data.isGrantee !== undefined) {
    if (parsed.data.isGrantee && nextExamResult === "FAILED") {
      return NextResponse.json(
        { success: false, error: "Failed examinees cannot be selected as grantees" },
        { status: 400 }
      )
    }

    updateData.isGrantee = parsed.data.isGrantee
    updateData.selectedById = parsed.data.isGrantee ? adminUserId : null
    updateData.selectedAt = parsed.data.isGrantee ? new Date() : null
  }

  const derivedStage = getDerivedStage(existingWorkflow.stage, parsed.data)
  if (derivedStage !== existingWorkflow.stage) {
    updateData.stage = derivedStage
  }

  const updatedWorkflow = await prisma.$transaction(async (tx) => {
    const workflow = await tx.spesWorkflow.update({
      where: { workflowId },
      data: updateData,
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
