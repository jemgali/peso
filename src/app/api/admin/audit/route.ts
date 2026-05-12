import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // @ts-ignore - Temporary bypass until prisma generate is run
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 logs
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    interface AuditLogRecord {
      id: string
      userId: string | null
      action: string
      entity: string
      entityId: string | null
      details: any
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
      user?: {
        name: string | null
        email: string
      } | null
    }

    const formattedLogs = (logs as AuditLogRecord[]).map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name || log.user?.email || "Unknown User",
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
      },
    })
  } catch (error) {
    console.error("[GET_AUDIT_LOGS_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
