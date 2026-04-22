import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const CLIENT_VISIBILITY: string[] = ["all", "clients"]

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const announcements = await prisma.scheduleEvent.findMany({
      where: {
        OR: [
          {
            type: { in: ["announcement", "deadline"] },
            visibility: { in: CLIENT_VISIBILITY },
          },
          {
            type: "schedule",
            visibility: "all",
          },
          {
            type: "schedule",
            visibility: "clients",
            AND: [
              { interviewWorkflows: { none: {} } },
              { examWorkflows: { none: {} } },
              { orientationWorkflows: { none: {} } },
              { recipients: { none: {} } },
            ],
          },
          {
            type: "schedule",
            visibility: "clients",
            recipients: {
              some: {
                userId,
              },
            },
          },
          {
            type: "schedule",
            visibility: "clients",
            OR: [
              {
                interviewWorkflows: {
                  some: {
                    submission: {
                      profile: {
                        userId,
                      },
                    },
                  },
                },
              },
              {
                examWorkflows: {
                  some: {
                    submission: {
                      profile: {
                        userId,
                      },
                    },
                  },
                },
              },
              {
                orientationWorkflows: {
                  some: {
                    submission: {
                      profile: {
                        userId,
                      },
                    },
                  },
                },
              },
            ],
          },
        ],
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
