import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createBatchSchema,
  type BatchListItem,
  type BatchListResponse,
  type CreateBatchResponse,
} from "@/lib/validations/spes-workflow"

function toBatchListItem(batch: {
  batchId: string
  batchName: string
  batchYear: number
  startDate: Date
  officeName: string | null
  createdAt: Date
  _count: { workflows: number }
}): BatchListItem {
  return {
    batchId: batch.batchId,
    batchName: batch.batchName,
    batchYear: batch.batchYear,
    startDate: batch.startDate.toISOString().slice(0, 10),
    officeName: batch.officeName,
    granteeCount: batch._count.workflows,
    createdAt: batch.createdAt.toISOString(),
  }
}

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return session.user.id
}

export async function GET(): Promise<NextResponse<BatchListResponse>> {
  const adminUserId = await getAdminUserId()
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const batches = await prisma.spesBatch.findMany({
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          workflows: true,
        },
      },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      batches: batches.map(toBatchListItem),
    },
  })
}

export async function POST(request: Request): Promise<NextResponse<CreateBatchResponse>> {
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

  const parsed = createBatchSchema.safeParse(payload)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || "Invalid batch input" },
      { status: 400 }
    )
  }

  const createdBatch = await prisma.spesBatch.create({
    data: {
      batchId: crypto.randomUUID(),
      batchName: parsed.data.batchName.trim().toUpperCase(),
      batchYear: parsed.data.batchYear,
      startDate: new Date(parsed.data.startDate),
      createdById: adminUserId,
    },
    include: {
      _count: {
        select: {
          workflows: true,
        },
      },
    },
  })

  // Notify all grantees without a batch assignment
  const unassignedGrantees = await prisma.spesWorkflow.findMany({
    where: {
      selectionStatus: "GRANTEE",
      batchId: null,
    },
    select: {
      submission: {
        select: {
          profile: {
            select: { userId: true },
          },
        },
      },
    },
  })

  const notificationData = unassignedGrantees
    .map((w) => w.submission.profile.userId)
    .filter((uid): uid is string => !!uid)
    .map((uid) => ({
      notificationId: crypto.randomUUID(),
      userId: uid,
      type: "batch_available",
      title: "Batches Available",
      message: `A new batch "${createdBatch.batchName}" is now available for selection. Please select your preferred batch from your dashboard.`,
      link: "/protected/client",
      isRead: false,
    }))

  if (notificationData.length > 0) {
    await prisma.notification.createMany({ data: notificationData })
  }

  // Audit Log
  const headersList = await headers()
  await logAudit({
    userId: adminUserId,
    action: "CREATE",
    entity: "SpesBatch",
    entityId: createdBatch.batchId,
    details: {
      after: {
        batchName: createdBatch.batchName,
        batchYear: createdBatch.batchYear,
        startDate: createdBatch.startDate,
      },
      message: `Created batch ${createdBatch.batchName}`,
    },
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
  })

  return NextResponse.json(
    {
      success: true,
      data: {
        batch: toBatchListItem(createdBatch),
      },
    },
    { status: 201 }
  )
}
