import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type {
  Prisma,
  SpesSelectionStatus as PrismaSelectionStatus,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  computeWorkflowRankMap,
  toApiApplicantCategory,
  toWorkflowListItem,
} from "@/lib/utils/spes-workflow"
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
    category: searchParams.get("category") || undefined,
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

  if (parsedQuery.data.category) {
    if (where.submission) {
      where.submission = {
        ...where.submission,
        applicantType: parsedQuery.data.category.toUpperCase() as any,
      }
    } else {
      where.submission = {
        applicantType: parsedQuery.data.category.toUpperCase() as any,
      }
    }
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
    orderBy: [{ examScore: "desc" }, { updatedAt: "desc" }],
  })

  const settings = await prisma.spesExamSettings.findUnique({
    where: { scope: "spes" },
    select: { totalScore: true },
  })
  const totalScore = settings?.totalScore ?? 100

  const rankMap = computeWorkflowRankMap(
    workflows.map((workflow) => ({
      workflowId: workflow.workflowId,
      applicantCategory: toApiApplicantCategory(workflow.submission.applicantType),
      examScore: workflow.examScore,
      priority: workflow.priority,
    }))
    ,
    { totalScore }
  )

  const sortedWorkflows = [...workflows].sort((a, b) => {
    const rankA = rankMap.get(a.workflowId) ?? null
    const rankB = rankMap.get(b.workflowId) ?? null
    if (rankA === null && rankB === null) return 0
    if (rankA === null) return 1
    if (rankB === null) return -1
    return rankA - rankB
  })

  return NextResponse.json({
    success: true,
    data: {
      workflows: sortedWorkflows.map((workflow) =>
        toWorkflowListItem(workflow, { rankPosition: rankMap.get(workflow.workflowId) ?? null })
      ),
    },
  })
}
