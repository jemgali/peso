import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  updateExamSettingsSchema,
  type ExamSettingsResponse,
} from "@/lib/validations/spes-workflow"

const SETTINGS_SCOPE = "spes"

function getPassingScore(totalScore: number, thresholdPercent: number): number {
  return Math.ceil((totalScore * thresholdPercent) / 100)
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

export async function GET(): Promise<NextResponse<ExamSettingsResponse>> {
  const adminUserId = await getAdminUserId()
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const settings = await prisma.spesExamSettings.upsert({
    where: { scope: SETTINGS_SCOPE },
    update: {},
    create: {
      settingsId: crypto.randomUUID(),
      scope: SETTINGS_SCOPE,
      totalScore: 100,
      passingThresholdPercent: 75,
      updatedById: adminUserId,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      totalScore: settings.totalScore,
      passingThresholdPercent: settings.passingThresholdPercent,
      passingScore: getPassingScore(
        settings.totalScore,
        settings.passingThresholdPercent
      ),
    },
  })
}

export async function PUT(request: Request): Promise<NextResponse<ExamSettingsResponse>> {
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

  const parsed = updateExamSettingsSchema.safeParse(payload)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || "Invalid exam settings" },
      { status: 400 }
    )
  }

  const settings = await prisma.spesExamSettings.upsert({
    where: { scope: SETTINGS_SCOPE },
    update: {
      totalScore: parsed.data.totalScore,
      passingThresholdPercent: parsed.data.passingThresholdPercent,
      updatedById: adminUserId,
    },
    create: {
      settingsId: crypto.randomUUID(),
      scope: SETTINGS_SCOPE,
      totalScore: parsed.data.totalScore,
      passingThresholdPercent: parsed.data.passingThresholdPercent,
      updatedById: adminUserId,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      totalScore: settings.totalScore,
      passingThresholdPercent: settings.passingThresholdPercent,
      passingScore: getPassingScore(
        settings.totalScore,
        settings.passingThresholdPercent
      ),
    },
  })
}
