import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createScheduleEventSchema } from "@/lib/validations/schedule-event"

async function requireAdminApi() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session || !session.user) {
    return null
  }

  const role = session.user.role || "client"
  if (role !== "admin") {
    return null
  }

  return session.user
}

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    const where: {
      startDate?: { gte?: Date; lte?: Date }
      type?: string
    } = {}

    if (startDate) {
      where.startDate = { gte: new Date(startDate) }
    }
    if (endDate) {
      where.startDate = { ...where.startDate, lte: new Date(endDate) }
    }
    if (type && type !== "all") {
      where.type = type
    }

    const events = await prisma.scheduleEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = createScheduleEventSchema.parse(body)

    const event = await prisma.scheduleEvent.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        type: validated.type,
        visibility: validated.visibility,
        startDate: validated.startDate,
        endDate: validated.endDate || null,
        allDay: validated.allDay,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
