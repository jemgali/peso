import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type { ApplicationListResponse, ApplicationStatus } from "@/lib/validations/application-review";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApplicationListResponse>> {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ApplicationStatus | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const search = searchParams.get("search") || "";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.profile = {
        OR: [
          { profileFirstName: { contains: search, mode: "insensitive" } },
          { profileLastName: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    // Fetch applications with pagination
    const [applications, total] = await Promise.all([
      prisma.applicationSubmission.findMany({
        where,
        include: {
          profile: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.applicationSubmission.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        applications: applications.map((app) => ({
          submissionId: app.submissionId,
          profileId: app.profileId,
          status: app.status as ApplicationStatus,
          submissionNumber: app.submissionNumber,
          submittedAt: app.submittedAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          applicant: {
            firstName: app.profile.profileFirstName,
            lastName: app.profile.profileLastName,
            email: app.profile.user.email,
          },
        })),
        total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
