import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return session.user.id
}

const updatePeriodSchema = z.object({
  isOpen: z.boolean(),
  closeDate: z
    .string()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      message: "Invalid close date",
    })
    .nullable()
    .optional(),
})

// GET: Get current year's application period settings
export async function GET() {
  const adminUserId = await getAdminUserId()
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    )
  }

  const currentYear = new Date().getFullYear()

  let period = await prisma.spesApplicationPeriod.findUnique({
    where: { year: currentYear },
  })

  // Auto-create period for current year if it doesn't exist
  if (!period) {
    period = await prisma.spesApplicationPeriod.create({
      data: {
        periodId: crypto.randomUUID(),
        year: currentYear,
        isOpen: false,
      },
    })
  }

  // Check if auto-close date has passed
  const now = new Date()
  if (period.isOpen && period.closeDate && new Date(period.closeDate) <= now) {
    period = await prisma.spesApplicationPeriod.update({
      where: { year: currentYear },
      data: {
        isOpen: false,
        updatedById: null, // system auto-close
      },
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      periodId: period.periodId,
      year: period.year,
      isOpen: period.isOpen,
      openDate: period.openDate?.toISOString() ?? null,
      closeDate: period.closeDate?.toISOString() ?? null,
      updatedAt: period.updatedAt.toISOString(),
    },
  })
}

// PUT: Update application period (toggle + optional close date)
export async function PUT(request: Request) {
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

  const parsed = updatePeriodSchema.safeParse(payload)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || "Invalid input" },
      { status: 400 }
    )
  }

  const currentYear = new Date().getFullYear()
  const { isOpen, closeDate } = parsed.data

  const period = await prisma.spesApplicationPeriod.upsert({
    where: { year: currentYear },
    create: {
      periodId: crypto.randomUUID(),
      year: currentYear,
      isOpen,
      openDate: isOpen ? new Date() : null,
      closeDate: closeDate ? new Date(closeDate) : null,
      updatedById: adminUserId,
    },
    update: {
      isOpen,
      openDate: isOpen ? new Date() : undefined,
      closeDate: closeDate ? new Date(closeDate) : null,
      updatedById: adminUserId,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      periodId: period.periodId,
      year: period.year,
      isOpen: period.isOpen,
      openDate: period.openDate?.toISOString() ?? null,
      closeDate: period.closeDate?.toISOString() ?? null,
      updatedAt: period.updatedAt.toISOString(),
    },
  })
}
