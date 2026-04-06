import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  NotificationListResponse,
  NotificationType,
} from "@/lib/validations/application-review";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: NextRequest
): Promise<NextResponse<NotificationListResponse>> {
  try {
    // Verify user authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    // Fetch notifications and unread count
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to most recent 50
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          notificationId: n.notificationId,
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
