import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  assignWorkflowSchema,
  type AssignWorkflowInput,
  type WorkflowAssignmentResponse,
} from "@/lib/validations/spes-workflow"
import { toApiStage, toWorkflowListItem } from "@/lib/utils/spes-workflow"

interface RouteParams {
  params: Promise<{ id: string }>
}

const CLIENT_APPLICATION_STATUS_ROUTE = "/protected/client/application/status"

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return session.user.id
}

function getValidationErrorMessage(
  issues: Array<{ path: PropertyKey[]; message: string }>
): string {
  return issues
    .map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join(".") : "payload"
      return `${field}: ${issue.message}`
    })
    .join(", ")
}

function deriveStage(
  currentStage: PrismaWorkflowStage,
  input: AssignWorkflowInput,
  nextAssignedOffice: string | null | undefined
): PrismaWorkflowStage {
  if (input.assignedOffice !== undefined && nextAssignedOffice) {
    return "OFFICE_ASSIGNED"
  }

  if (input.batchId !== undefined && input.batchId) {
    return "BATCH_ASSIGNED"
  }

  return currentStage
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<WorkflowAssignmentResponse>> {
  const adminUserId = await getAdminUserId()
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const payload = await request.json().catch(() => null)
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  const parsed = assignWorkflowSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: getValidationErrorMessage(parsed.error.issues),
      },
      { status: 400 }
    )
  }

  const { id: workflowId } = await params
  const existingWorkflow = await prisma.spesWorkflow.findUnique({
    where: { workflowId },
    select: {
      workflowId: true,
      stage: true,
      batchId: true,
      assignedOffice: true,
      submission: {
        select: {
          profile: {
            select: {
              userId: true,
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

  const nextAssignedOffice =
    parsed.data.assignedOffice === undefined ? undefined : parsed.data.assignedOffice?.trim() || null

  const batchChanged =
    parsed.data.batchId !== undefined && parsed.data.batchId !== existingWorkflow.batchId
  const officeChanged =
    nextAssignedOffice !== undefined && nextAssignedOffice !== existingWorkflow.assignedOffice

  if (!batchChanged && !officeChanged) {
    return NextResponse.json(
      { success: false, error: "No assignment changes detected" },
      { status: 409 }
    )
  }

  const nextStage = deriveStage(existingWorkflow.stage, parsed.data, nextAssignedOffice)
  const stageChanged = nextStage !== existingWorkflow.stage
  const note = parsed.data.note?.trim() || null

  const result = await prisma.$transaction(async (tx) => {
    const updateData: Prisma.SpesWorkflowUncheckedUpdateInput = {}

    if (batchChanged) {
      updateData.batchId = parsed.data.batchId
    }

    if (officeChanged) {
      updateData.assignedOffice = nextAssignedOffice
    }

    if (stageChanged) {
      updateData.stage = nextStage
    }

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

    if (stageChanged) {
      await tx.spesStageHistory.create({
        data: {
          historyId: crypto.randomUUID(),
          workflowId,
          stage: nextStage,
          note,
          createdById: adminUserId,
        },
      })
    }

    let batchNotificationSent = false
    let officeNotificationSent = false

    if (batchChanged && workflow.batchId) {
      const batchLabel = workflow.batch?.batchName || workflow.batchId
      const batchTitle = existingWorkflow.batchId
        ? "SPES Batch Assignment Updated"
        : "SPES Batch Assigned"
      const batchMessage = existingWorkflow.batchId
        ? `Your SPES batch assignment was updated to ${batchLabel}.`
        : `You were assigned to SPES batch ${batchLabel}.`

      await tx.notification.create({
        data: {
          notificationId: crypto.randomUUID(),
          userId: existingWorkflow.submission.profile.userId,
          type: "application_approved",
          title: batchTitle,
          message: batchMessage,
          link: CLIENT_APPLICATION_STATUS_ROUTE,
        },
      })

      batchNotificationSent = true
    }

    if (officeChanged && workflow.assignedOffice) {
      const officeTitle = existingWorkflow.assignedOffice
        ? "SPES Office Assignment Updated"
        : "SPES Office Assigned"
      const officeMessage = existingWorkflow.assignedOffice
        ? `Your assigned SPES office was updated to ${workflow.assignedOffice}.`
        : `You were assigned to ${workflow.assignedOffice} for SPES deployment.`

      await tx.notification.create({
        data: {
          notificationId: crypto.randomUUID(),
          userId: existingWorkflow.submission.profile.userId,
          type: "application_approved",
          title: officeTitle,
          message: officeMessage,
          link: CLIENT_APPLICATION_STATUS_ROUTE,
        },
      })

      officeNotificationSent = true
    }

    return {
      workflow,
      batchNotificationSent,
      officeNotificationSent,
      stage: workflow.stage,
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      workflow: toWorkflowListItem(result.workflow),
      assignment: {
        batchChanged,
        officeChanged,
        stageChanged,
        stage: toApiStage(result.stage),
      },
      notifications: {
        batch: result.batchNotificationSent,
        office: result.officeNotificationSent,
      },
    },
  })
}
