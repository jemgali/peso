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
  startDate: Date
  officeName: string | null
  createdAt: Date
  _count: { workflows: number }
}): BatchListItem {
  return {
    batchId: batch.batchId,
    batchName: batch.batchName,
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
      batchName: parsed.data.batchName.trim(),
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
