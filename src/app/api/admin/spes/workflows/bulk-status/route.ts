import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesSelectionStatus as PrismaSelectionStatus,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  bulkUpdateWorkflowStatusSchema,
  type BulkUpdateWorkflowStatusResponse,
} from "@/lib/validations/spes-workflow"
import { toDbSelectionStatus } from "@/lib/utils/spes-workflow"

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

function getStageFromSelectionStatus(
  currentStage: PrismaWorkflowStage,
  selectionStatus: PrismaSelectionStatus
): PrismaWorkflowStage {
  if (selectionStatus === "GRANTEE") return "GRANTEE_SELECTED"
  if (selectionStatus === "WAITLISTED") return "WAITLISTED"

  if (selectionStatus === "PENDING" || selectionStatus === "DENIED") {
    if (currentStage === "GRANTEE_SELECTED" || currentStage === "WAITLISTED") {
      return "EXAM_EVALUATED"
    }
  }

  return currentStage
}

export async function POST(
  request: Request
): Promise<NextResponse<BulkUpdateWorkflowStatusResponse>> {
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

  const parsed = bulkUpdateWorkflowStatusSchema.safeParse(payload)
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
  const requestedSelectionStatus = toDbSelectionStatus(parsed.data.selectionStatus)
  const note = parsed.data.note?.trim() || null

  const existingWorkflows = await prisma.spesWorkflow.findMany({
    where: {
      workflowId: { in: workflowIds },
    },
    select: {
      workflowId: true,
      examResult: true,
      selectionStatus: true,
      selectedById: true,
      stage: true,
    },
  })

  if (existingWorkflows.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid workflows found for status update" },
      { status: 404 }
    )
  }

  const foundIds = new Set(existingWorkflows.map((workflow) => workflow.workflowId))
  const missingWorkflowIds = workflowIds.filter((workflowId) => !foundIds.has(workflowId))

  let updated = 0
  let autoDenied = 0

  await prisma.$transaction(async (tx) => {
    for (const workflow of existingWorkflows) {
      const nextSelectionStatus =
        workflow.examResult === "FAILED" ? "DENIED" : requestedSelectionStatus

      if (workflow.examResult === "FAILED" && requestedSelectionStatus !== "DENIED") {
        autoDenied += 1
      }

      const nextStage = getStageFromSelectionStatus(workflow.stage, nextSelectionStatus)
      const nextSelectedById =
        nextSelectionStatus === "GRANTEE" ? adminUserId : null
      const nextSelectedAt = nextSelectionStatus === "GRANTEE" ? new Date() : null

      const hasSelectionChange = workflow.selectionStatus !== nextSelectionStatus
      const hasStageChange = workflow.stage !== nextStage
      const hasSelectorChange = workflow.selectedById !== nextSelectedById

      if (!hasSelectionChange && !hasStageChange && !hasSelectorChange) {
        continue
      }

      const updateData: Prisma.SpesWorkflowUncheckedUpdateInput = {
        selectionStatus: nextSelectionStatus,
        selectedById: nextSelectedById,
        selectedAt: nextSelectedAt,
      }

      if (hasStageChange) {
        updateData.stage = nextStage
      }

      await tx.spesWorkflow.update({
        where: { workflowId: workflow.workflowId },
        data: updateData,
      })

      if (hasStageChange) {
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

      updated += 1
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      requested: workflowIds.length,
      updated,
      autoDenied,
      missingWorkflowIds,
    },
  })
}
