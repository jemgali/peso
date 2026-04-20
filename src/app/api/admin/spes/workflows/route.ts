import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesSelectionStatus as PrismaSelectionStatus,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeWorkflowRankMap, toWorkflowListItem } from "@/lib/utils/spes-workflow"
import {
  listWorkflowsQuerySchema,
  type SpesWorkflowListResponse,
} from "@/lib/validations/spes-workflow"

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session?.user?.role === "admin"
}

export async function GET(request: Request): Promise<NextResponse<SpesWorkflowListResponse>> {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const parsedQuery = listWorkflowsQuerySchema.safeParse({
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { success: false, error: parsedQuery.error.issues[0]?.message || "Invalid query parameters" },
      { status: 400 }
    )
  }

  const where: Prisma.SpesWorkflowWhereInput = {}
  const search = parsedQuery.data.search?.trim()
  if (search) {
    where.submission = {
      profile: {
        OR: [
          { profileFirstName: { contains: search, mode: "insensitive" } },
          { profileLastName: { contains: search, mode: "insensitive" } },
        ],
      },
    }
  }

  if (parsedQuery.data.status) {
    where.selectionStatus = parsedQuery.data.status.toUpperCase() as PrismaSelectionStatus
  }

  const workflows = await prisma.spesWorkflow.findMany({
    where,
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
    orderBy: [{ examScore: "desc" }, { updatedAt: "desc" }],
  })

  const rankMap = computeWorkflowRankMap(
    workflows.map((workflow) => ({
      workflowId: workflow.workflowId,
      examScore: workflow.examScore,
    }))
  )

  return NextResponse.json({
    success: true,
    data: {
      workflows: workflows.map((workflow) =>
        toWorkflowListItem(workflow, { rankPosition: rankMap.get(workflow.workflowId) ?? null })
      ),
    },
  })
}
