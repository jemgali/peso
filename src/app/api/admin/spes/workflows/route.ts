import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ensureApprovedSpesWorkflows,
  toWorkflowListItem,
} from "@/lib/utils/spes-workflow"
import type { SpesWorkflowListResponse } from "@/lib/validations/spes-workflow"

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session?.user?.role === "admin"
}

export async function GET(): Promise<NextResponse<SpesWorkflowListResponse>> {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  await ensureApprovedSpesWorkflows()

  const workflows = await prisma.spesWorkflow.findMany({
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
    orderBy: [{ isGrantee: "desc" }, { updatedAt: "desc" }],
  })

  return NextResponse.json({
    success: true,
    data: {
      workflows: workflows.map(toWorkflowListItem),
    },
  })
}
