import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateScheduleEventSchema } from "@/lib/validations/schedule-event"

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const event = await prisma.scheduleEvent.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateScheduleEventSchema.parse({ ...body, id })

    const existingEvent = await prisma.scheduleEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const event = await prisma.scheduleEvent.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description !== undefined ? validated.description || null : undefined,
        type: validated.type,
        startDate: validated.startDate,
        endDate: validated.endDate !== undefined ? validated.endDate || null : undefined,
        allDay: validated.allDay,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error updating event:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const existingEvent = await prisma.scheduleEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.scheduleEvent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}
