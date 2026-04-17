import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const announcements = await prisma.scheduleEvent.findMany({
      where: {
        type: { in: ["announcement", "schedule", "deadline"] },
        visibility: { in: ["all", "clients"] },
      },
      orderBy: { startDate: "desc" },
      take: 30,
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Error fetching client announcements:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    )
  }
}
