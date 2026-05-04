import { NextResponse } from "next/server"
import { prisma as db } from "@/lib/prisma"
import { submitRemarkSchema } from "@/lib/validations/spes-remarks"
import { createId } from "@paralleldrive/cuid2"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { Prisma } from "@/generated/prisma/client"

async function requireAdminApi() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session || !session.user || session.user.role !== "admin") return null
  return session.user
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdminApi()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim()

    const whereClause: Prisma.SpesWorkflowWhereInput = {
      selectionStatus: "GRANTEE",
    }

    if (search) {
      whereClause.submission = {
        profile: {
          OR: [
            { profileFirstName: { contains: search, mode: "insensitive" } },
            { profileLastName: { contains: search, mode: "insensitive" } },
            { profileMiddleName: { contains: search, mode: "insensitive" } },
          ],
        },
      }
    }

    const workflows = await db.spesWorkflow.findMany({
      where: whereClause,
      include: {
        submission: {
          include: {
            profile: true,
          },
        },
        batch: true,
        granteeRecords: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const grantees = workflows.map((workflow) => {
      const profile = workflow.submission?.profile
      const applicantName = profile
        ? [profile.profileFirstName, profile.profileMiddleName, profile.profileLastName, profile.profileSuffix]
            .filter(Boolean)
            .join(" ")
        : "Unknown Applicant"

      const applicationYear = workflow.batch?.startDate
        ? new Date(workflow.batch.startDate).getFullYear()
        : null

      return {
        workflowId: workflow.workflowId,
        applicantName,
        records: workflow.granteeRecords.map((record) => ({
          recordId: record.recordId,
          workflowId: record.workflowId,
          applicationYear: applicationYear,
          assignedOffice: workflow.assignedOffice,
          punctuality: record.punctuality,
          respect: record.respect,
          honesty: record.honesty,
          adaptability: record.adaptability,
          expression: record.expression,
          initiative: record.initiative,
          following: record.following,
          efficiency: record.efficiency,
          creativity: record.creativity,
          remarks: record.remarks,
          ratedBy: record.ratedBy,
          documentUrl: record.documentUrl,
          createdAt: record.createdAt.toISOString(),
        })),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        grantees,
      },
    })
  } catch (error) {
    console.error("[GET_SPES_REMARKS_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminApi()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const json = await req.json()
    const parsed = submitRemarkSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation Error" },
        { status: 400 }
      )
    }

    const {
      workflowId,
      punctuality,
      respect,
      honesty,
      adaptability,
      expression,
      initiative,
      following,
      efficiency,
      creativity,
      remarks,
      ratedBy,
      documentUrl,
    } = parsed.data

    const workflow = await db.spesWorkflow.findUnique({
      where: { workflowId },
      include: { batch: true },
    })

    if (!workflow) {
      return NextResponse.json({ success: false, error: "Workflow not found" }, { status: 404 })
    }

    const record = await db.spesGranteeRecord.create({
      data: {
        recordId: `sgr_${createId()}`,
        workflowId,
        punctuality,
        respect,
        honesty,
        adaptability,
        expression,
        initiative,
        following,
        efficiency,
        creativity,
        remarks,
        ratedBy,
        documentUrl,
      },
    })

    const applicationYear = workflow.batch?.startDate
      ? new Date(workflow.batch.startDate).getFullYear()
      : null

    return NextResponse.json({
      success: true,
      data: {
        record: {
          recordId: record.recordId,
          workflowId: record.workflowId,
          applicationYear: applicationYear,
          assignedOffice: workflow.assignedOffice,
          punctuality: record.punctuality,
          respect: record.respect,
          honesty: record.honesty,
          adaptability: record.adaptability,
          expression: record.expression,
          initiative: record.initiative,
          following: record.following,
          efficiency: record.efficiency,
          creativity: record.creativity,
          remarks: record.remarks,
          ratedBy: record.ratedBy,
          documentUrl: record.documentUrl,
          createdAt: record.createdAt.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("[POST_SPES_REMARK_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
