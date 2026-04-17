import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import type {
  Prisma,
  SpesWorkflowStage as PrismaWorkflowStage,
} from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

interface WorkflowSchedulingResponse {
  success: boolean
  data?: {
    workflowId: string
    submissionId: string
    stage: string
    stageType: ScheduleStageType
    scheduleEvent: {
      id: string
      title: string
      description: string | null
      type: string
      visibility: string
      startDate: string
      endDate: string | null
      allDay: boolean
    }
    notification: {
      title: string
      message: string
      type: string
      link: string
    }
    wasUpdated: boolean
  }
  error?: string
}

const stageTypeSchema = z.enum(["interview", "exam", "orientation"])
type ScheduleStageType = z.infer<typeof stageTypeSchema>

const scheduleWorkflowSchema = z
  .object({
    stageType: stageTypeSchema,
    title: z.string().trim().max(160, "Title is too long").optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .nullable()
      .optional(),
    startDate: z.coerce.date({
      error: "Invalid start date",
    }),
    endDate: z.coerce
      .date({
        error: "Invalid end date",
      })
      .nullable()
      .optional(),
    allDay: z.boolean().optional().default(false),
  })
  .refine(
    (value) => !value.endDate || value.endDate.getTime() >= value.startDate.getTime(),
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )

const STAGE_CONFIG: Record<
  ScheduleStageType,
  {
    label: "Interview" | "Exam" | "Orientation"
    workflowStage: PrismaWorkflowStage
    notificationTypeBase: string
  }
> = {
  interview: {
    label: "Interview",
    workflowStage: "INTERVIEW_SCHEDULED",
    notificationTypeBase: "spes_interview_schedule",
  },
  exam: {
    label: "Exam",
    workflowStage: "EXAM_SCHEDULED",
    notificationTypeBase: "spes_exam_schedule",
  },
  orientation: {
    label: "Orientation",
    workflowStage: "ORIENTATION_SCHEDULED",
    notificationTypeBase: "spes_orientation_schedule",
  },
}

const CLIENT_APPLICATION_STATUS_LINK = "/protected/client/application/status"

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return session.user.id
}

function resolveWorkflowEventId(
  workflow: {
    interviewScheduleEventId: string | null
    examScheduleEventId: string | null
    orientationScheduleEventId: string | null
  },
  stageType: ScheduleStageType
): string | null {
  if (stageType === "interview") return workflow.interviewScheduleEventId
  if (stageType === "exam") return workflow.examScheduleEventId
  return workflow.orientationScheduleEventId
}

function getWorkflowScheduleUpdateData(
  stageType: ScheduleStageType,
  scheduleEventId: string,
  workflowStage: PrismaWorkflowStage
): Prisma.SpesWorkflowUncheckedUpdateInput {
  if (stageType === "interview") {
    return {
      interviewScheduleEventId: scheduleEventId,
      stage: workflowStage,
    }
  }

  if (stageType === "exam") {
    return {
      examScheduleEventId: scheduleEventId,
      stage: workflowStage,
    }
  }

  return {
    orientationScheduleEventId: scheduleEventId,
    stage: workflowStage,
  }
}

function formatScheduleDateTime(
  startDate: Date,
  endDate: Date | null,
  allDay: boolean
): string {
  const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  })
  const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  if (allDay) {
    if (endDate && endDate.toDateString() !== startDate.toDateString()) {
      return `${dateFormatter.format(startDate)} to ${dateFormatter.format(endDate)}`
    }

    return dateFormatter.format(startDate)
  }

  if (endDate) {
    return `${dateTimeFormatter.format(startDate)} to ${dateTimeFormatter.format(endDate)}`
  }

  return dateTimeFormatter.format(startDate)
}

function buildDefaultTitle(
  title: string | undefined,
  stageLabel: "Interview" | "Exam" | "Orientation",
  applicantName: string
): string {
  const trimmedTitle = title?.trim()
  if (trimmedTitle) {
    return trimmedTitle
  }

  return `SPES ${stageLabel} - ${applicantName || "Applicant"}`
}

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<WorkflowSchedulingResponse>> {
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

  const parsed = scheduleWorkflowSchema.safeParse(payload)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || "Invalid scheduling payload" },
      { status: 400 }
    )
  }

  const { id: workflowId } = await params
  const workflow = await prisma.spesWorkflow.findUnique({
    where: { workflowId },
    select: {
      workflowId: true,
      submissionId: true,
      stage: true,
      interviewScheduleEventId: true,
      examScheduleEventId: true,
      orientationScheduleEventId: true,
      submission: {
        select: {
          profile: {
            select: {
              userId: true,
              profileFirstName: true,
              profileLastName: true,
            },
          },
        },
      },
    },
  })

  if (!workflow) {
    return NextResponse.json(
      { success: false, error: "Workflow not found" },
      { status: 404 }
    )
  }

  const { stageType, startDate, endDate, allDay } = parsed.data
  const stageConfig = STAGE_CONFIG[stageType]
  const fullName = [
    workflow.submission.profile.profileFirstName?.trim() || "",
    workflow.submission.profile.profileLastName?.trim() || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  const eventTitle = buildDefaultTitle(parsed.data.title, stageConfig.label, fullName)
  const eventDescription = parsed.data.description?.trim() || null

  try {
    const result = await prisma.$transaction(async (tx) => {
      const linkedEventId = resolveWorkflowEventId(workflow, stageType)
      const existingEvent = linkedEventId
        ? await tx.scheduleEvent.findUnique({
            where: { id: linkedEventId },
            select: { id: true },
          })
        : null

      const scheduleEvent = existingEvent
        ? await tx.scheduleEvent.update({
            where: { id: existingEvent.id },
            data: {
              title: eventTitle,
              description: eventDescription,
              type: "schedule",
              visibility: "clients",
              startDate,
              endDate: endDate || null,
              allDay,
            },
          })
        : await tx.scheduleEvent.create({
            data: {
              title: eventTitle,
              description: eventDescription,
              type: "schedule",
              visibility: "clients",
              startDate,
              endDate: endDate || null,
              allDay,
            },
          })

      const workflowUpdateData = getWorkflowScheduleUpdateData(
        stageType,
        scheduleEvent.id,
        stageConfig.workflowStage
      )

      const updatedWorkflow = await tx.spesWorkflow.update({
        where: { workflowId },
        data: workflowUpdateData,
        select: {
          workflowId: true,
          submissionId: true,
          stage: true,
        },
      })

      const wasUpdated = Boolean(existingEvent)
      const scheduleDateLabel = formatScheduleDateTime(startDate, endDate || null, allDay)
      const notificationTitle = wasUpdated
        ? `${stageConfig.label} Schedule Updated`
        : `${stageConfig.label} Scheduled`
      const notificationMessage = wasUpdated
        ? `Your SPES ${stageConfig.label.toLowerCase()} schedule has been updated to ${scheduleDateLabel}.`
        : `Your SPES ${stageConfig.label.toLowerCase()} has been scheduled for ${scheduleDateLabel}.`
      const notificationType = wasUpdated
        ? `${stageConfig.notificationTypeBase}_updated`
        : `${stageConfig.notificationTypeBase}_created`

      await tx.spesStageHistory.create({
        data: {
          historyId: crypto.randomUUID(),
          workflowId: updatedWorkflow.workflowId,
          stage: updatedWorkflow.stage,
          note: notificationTitle,
          createdById: adminUserId,
        },
      })

      await tx.notification.create({
        data: {
          notificationId: crypto.randomUUID(),
          userId: workflow.submission.profile.userId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          link: CLIENT_APPLICATION_STATUS_LINK,
        },
      })

      return {
        workflow: updatedWorkflow,
        scheduleEvent,
        notification: {
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          link: CLIENT_APPLICATION_STATUS_LINK,
        },
        wasUpdated,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        workflowId: result.workflow.workflowId,
        submissionId: result.workflow.submissionId,
        stage: result.workflow.stage.toLowerCase(),
        stageType,
        scheduleEvent: {
          id: result.scheduleEvent.id,
          title: result.scheduleEvent.title,
          description: result.scheduleEvent.description,
          type: result.scheduleEvent.type,
          visibility: result.scheduleEvent.visibility,
          startDate: result.scheduleEvent.startDate.toISOString(),
          endDate: result.scheduleEvent.endDate?.toISOString() || null,
          allDay: result.scheduleEvent.allDay,
        },
        notification: result.notification,
        wasUpdated: result.wasUpdated,
      },
    })
  } catch (error) {
    console.error("Error scheduling SPES workflow event:", error)
    return NextResponse.json(
      { success: false, error: "Failed to schedule workflow event" },
      { status: 500 }
    )
  }
}
