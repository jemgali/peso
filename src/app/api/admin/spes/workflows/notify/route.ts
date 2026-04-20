import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEvaluationBulkNotifyEmail } from "@/lib/email"
import {
  bulkNotifyWorkflowsSchema,
  type BulkNotifyWorkflowsResponse,
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

function getApplicantName(firstName: string | null, lastName: string | null): string {
  return [firstName?.trim() || "", lastName?.trim() || ""].filter(Boolean).join(" ").trim() || "Applicant"
}

export async function POST(request: Request): Promise<NextResponse<BulkNotifyWorkflowsResponse>> {
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

  const parsed = bulkNotifyWorkflowsSchema.safeParse(payload)
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
  const note = parsed.data.note?.trim() || null

  const workflows = await prisma.spesWorkflow.findMany({
    where: {
      workflowId: { in: workflowIds },
    },
    select: {
      workflowId: true,
      submission: {
        select: {
          profile: {
            select: {
              userId: true,
              profileFirstName: true,
              profileLastName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (workflows.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid applicants found for notification" },
      { status: 404 }
    )
  }

  const foundIds = new Set(workflows.map((workflow) => workflow.workflowId))
  const missingWorkflowIds = workflowIds.filter((workflowId) => !foundIds.has(workflowId))
  const notificationTitle = "SPES Evaluation Update"
  const notificationMessage = note
    ? `PESO sent an update regarding your SPES application evaluation. Please check your application status page for details and next steps. Admin note: ${note}`
    : "PESO sent an update regarding your SPES application evaluation. Please check your application status page for details and next steps."

  await prisma.$transaction(async (tx) => {
    await tx.notification.createMany({
      data: workflows.map((workflow) => ({
        notificationId: crypto.randomUUID(),
        userId: workflow.submission.profile.userId,
        type: "application_revision",
        title: notificationTitle,
        message: notificationMessage,
        link: CLIENT_APPLICATION_STATUS_ROUTE,
      })),
    })
  })

  const emailResults = await Promise.allSettled(
    workflows.map((workflow) =>
      sendEvaluationBulkNotifyEmail({
        to: workflow.submission.profile.user.email,
        applicantName: getApplicantName(
          workflow.submission.profile.profileFirstName,
          workflow.submission.profile.profileLastName
        ),
        note: note || undefined,
      })
    )
  )

  let emailSent = 0
  for (const result of emailResults) {
    if (result.status === "fulfilled" && result.value.success) {
      emailSent += 1
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      requested: workflowIds.length,
      notified: workflows.length,
      emailSent,
      emailFailed: workflows.length - emailSent,
      missingWorkflowIds,
    },
  })
}
