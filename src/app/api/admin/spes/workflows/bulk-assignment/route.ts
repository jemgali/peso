import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  bulkAssignWorkflowsSchema,
  type BulkAssignWorkflowsResponse,
} from "@/lib/validations/spes-workflow"

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
  options: {
    hasBatchInput: boolean
    nextBatchId: string | undefined
    hasOfficeInput: boolean
    nextAssignedOffice: string | undefined
    removeFromBatch: boolean
  }
): PrismaWorkflowStage {
  if (options.hasOfficeInput && options.nextAssignedOffice) {
    return "OFFICE_ASSIGNED"
  }

  if (options.hasBatchInput && options.nextBatchId) {
    return "BATCH_ASSIGNED"
  }

  if (options.removeFromBatch) {
    return "GRANTEE_SELECTED"
  }

  return currentStage
}

export async function POST(request: Request): Promise<NextResponse<BulkAssignWorkflowsResponse>> {
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

  const parsed = bulkAssignWorkflowsSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: getValidationErrorMessage(parsed.error.issues),
      },
      { status: 400 }
    )
  }

  const workflowIds = [...new Set(parsed.data.workflowIds.map((id) => id.trim()).filter(Boolean))]
  const batchInput = parsed.data.batchId
  const nextBatchId = batchInput?.trim()
  const nextAssignedOffice = parsed.data.assignedOffice?.trim()
  const hasBatchInput = parsed.data.batchId !== undefined
  const hasOfficeInput = parsed.data.assignedOffice !== undefined
  const removeFromBatchInput = hasBatchInput && batchInput === null
  const note = parsed.data.note?.trim() || null

  let batchLabel: string | null = null
  if (nextBatchId) {
    const batch = await prisma.spesBatch.findUnique({
      where: { batchId: nextBatchId },
      select: { batchId: true, batchName: true },
    })

    if (!batch) {
      return NextResponse.json(
        { success: false, error: "Selected batch does not exist" },
        { status: 400 }
      )
    }

    batchLabel = batch.batchName || batch.batchId
  }

  const existingWorkflows = await prisma.spesWorkflow.findMany({
    where: {
      workflowId: { in: workflowIds },
    },
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

  if (existingWorkflows.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid workflows found for assignment update" },
      { status: 404 }
    )
  }

  const foundIds = new Set(existingWorkflows.map((workflow) => workflow.workflowId))
  const missingWorkflowIds = workflowIds.filter((workflowId) => !foundIds.has(workflowId))

  let updated = 0

  await prisma.$transaction(async (tx) => {
    const notifications: Prisma.NotificationCreateManyInput[] = []

    for (const workflow of existingWorkflows) {
      const batchChanged = hasBatchInput && nextBatchId !== workflow.batchId
      const clearOfficeForRemoval =
        removeFromBatchInput && batchChanged && workflow.assignedOffice !== null
      const officeChanged = hasOfficeInput
        ? nextAssignedOffice !== workflow.assignedOffice
        : clearOfficeForRemoval

      if (!batchChanged && !officeChanged) {
        continue
      }

      const nextStage = deriveStage(workflow.stage, {
        hasBatchInput,
        nextBatchId,
        hasOfficeInput,
        nextAssignedOffice,
        removeFromBatch: removeFromBatchInput && batchChanged,
      })
      const stageChanged = nextStage !== workflow.stage

      const updateData: Prisma.SpesWorkflowUncheckedUpdateInput = {}
      if (batchChanged) {
        updateData.batchId = nextBatchId || null
      }
      if (hasOfficeInput) {
        updateData.assignedOffice = nextAssignedOffice || null
      } else if (clearOfficeForRemoval) {
        updateData.assignedOffice = null
      }
      if (stageChanged) {
        updateData.stage = nextStage
      }

      await tx.spesWorkflow.update({
        where: { workflowId: workflow.workflowId },
        data: updateData,
      })

      if (stageChanged) {
        await tx.spesStageHistory.create({
          data: {
            historyId: crypto.randomUUID(),
            workflowId: workflow.workflowId,
            stage: nextStage,
            note,
            createdById: adminUserId,
          },
        })
      }

      if (batchChanged && nextBatchId) {
        const title = workflow.batchId ? "SPES Batch Assignment Updated" : "SPES Batch Assigned"
        const message = workflow.batchId
          ? `Your SPES batch assignment was updated to ${batchLabel || nextBatchId}.`
          : `You were assigned to SPES batch ${batchLabel || nextBatchId}.`
        notifications.push({
          notificationId: crypto.randomUUID(),
          userId: workflow.submission.profile.userId,
          type: "application_approved",
          title,
          message,
          link: CLIENT_APPLICATION_STATUS_ROUTE,
        })
      }

      if (officeChanged && nextAssignedOffice) {
        const title = workflow.assignedOffice
          ? "SPES Office Assignment Updated"
          : "SPES Office Assigned"
        const message = workflow.assignedOffice
          ? `Your assigned SPES office was updated to ${nextAssignedOffice}.`
          : `You were assigned to ${nextAssignedOffice} for SPES deployment.`
        notifications.push({
          notificationId: crypto.randomUUID(),
          userId: workflow.submission.profile.userId,
          type: "application_approved",
          title,
          message,
          link: CLIENT_APPLICATION_STATUS_ROUTE,
        })
      }

      updated += 1
    }

    if (notifications.length > 0) {
      await tx.notification.createMany({
        data: notifications,
      })
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      requested: workflowIds.length,
      updated,
      missingWorkflowIds,
    },
  })
}
