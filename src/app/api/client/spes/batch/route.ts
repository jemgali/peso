import { NextResponse } from "next/server"
import { prisma as db } from "@/lib/prisma"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { createId } from "@paralleldrive/cuid2"

async function requireUserApi() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session || !session.user) return null
  return session.user
}

export async function GET(req: Request) {
  try {
    const user = await requireUserApi()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const submission = await db.applicationSubmission.findFirst({
      where: {
        profile: {
          userId: user.id,
        },
        status: "approved",
      },
      include: {
        spesWorkflow: true,
      },
    })

    if (!submission || !submission.spesWorkflow) {
      return NextResponse.json({ success: false, error: "No active SPES application" }, { status: 404 })
    }

    const workflow = submission.spesWorkflow

    if (workflow.selectionStatus !== "GRANTEE") {
      return NextResponse.json({ success: false, error: "Not a grantee yet" }, { status: 403 })
    }

    const currentYear = new Date().getFullYear()

    // Get batches for current year
    const batches = await db.spesBatch.findMany({
      where: {
        batchYear: currentYear,
      },
      orderBy: {
        startDate: "asc",
      },
      include: {
        workflows: true, // we might need to count if we enforce limits later
      },
    })

    const availableBatches = batches.map(b => ({
      batchId: b.batchId,
      batchName: b.batchName,
      startDate: b.startDate.toISOString(),
      memberCount: b.workflows.length,
    }))

    return NextResponse.json({
      success: true,
      data: {
        currentBatchId: workflow.batchId,
        availableBatches,
      },
    })
  } catch (error) {
    console.error("[GET_CLIENT_SPES_BATCH_ERROR]", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

const selectBatchSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
})

export async function POST(req: Request) {
  try {
    const user = await requireUserApi()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const submission = await db.applicationSubmission.findFirst({
      where: {
        profile: {
          userId: user.id,
        },
        status: "approved",
      },
      include: {
        spesWorkflow: true,
      },
    })

    if (!submission || !submission.spesWorkflow) {
      return NextResponse.json({ success: false, error: "No active SPES application" }, { status: 404 })
    }

    const workflow = submission.spesWorkflow

    if (workflow.selectionStatus !== "GRANTEE") {
      return NextResponse.json({ success: false, error: "Not a grantee" }, { status: 403 })
    }

    if (workflow.batchId) {
      return NextResponse.json({ success: false, error: "Batch already assigned" }, { status: 400 })
    }

    const json = await req.json()
    const parsed = selectBatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid batch selection" }, { status: 400 })
    }

    const { batchId } = parsed.data

    const targetBatch = await db.spesBatch.findUnique({
      where: { batchId },
    })

    if (!targetBatch) {
      return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 })
    }

    // Assign batch
    await db.spesWorkflow.update({
      where: { workflowId: workflow.workflowId },
      data: {
        batchId: targetBatch.batchId,
        stage: "BATCH_ASSIGNED",
      },
    })

    // Log history
    await db.spesStageHistory.create({
      data: {
        historyId: `sh_${createId()}`,
        workflowId: workflow.workflowId,
        stage: "BATCH_ASSIGNED",
        note: "Grantee self-selected batch",
      },
    })

    return NextResponse.json({ success: true, data: { batchId: targetBatch.batchId } })
  } catch (error) {
    console.error("[POST_CLIENT_SPES_BATCH_ERROR]", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
