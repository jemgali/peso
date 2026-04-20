import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  ApplicantType,
  ApplicationListResponse,
  ApplicationStatus,
} from "@/lib/validations/application-review";
import { APPLICATION_STATUSES } from "@/lib/validations/application-review";

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
    const statusParam = searchParams.get("status");
    const status = APPLICATION_STATUSES.includes(statusParam as ApplicationStatus)
      ? (statusParam as ApplicationStatus)
      : null;
    const yearParam = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const search = searchParams.get("search") || "";
    const currentYear = new Date().getFullYear();
    const selectedYear =
      yearParam && Number.isFinite(Number(yearParam))
        ? Number.parseInt(yearParam, 10)
        : currentYear;
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
    const nextYearStart = new Date(Date.UTC(selectedYear + 1, 0, 1, 0, 0, 0));

    // Build where clause
    const where: {
      status?: ApplicationStatus;
      submittedAt?: { gte: Date; lt: Date };
      profile?: {
        OR: Array<
          | { profileFirstName: { contains: string; mode: "insensitive" } }
          | { profileLastName: { contains: string; mode: "insensitive" } }
          | { user: { email: { contains: string; mode: "insensitive" } } }
        >;
      };
    } = {};
    
    if (status) {
      where.status = status;
    }
    where.submittedAt = {
      gte: yearStart,
      lt: nextYearStart,
    };

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
    const [applications, total, submissionYears] = await Promise.all([
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
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.applicationSubmission.count({ where }),
      prisma.applicationSubmission.findMany({
        select: { submittedAt: true },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    const availableYears = Array.from(
      new Set(submissionYears.map((entry) => entry.submittedAt.getUTCFullYear()))
    );
    if (availableYears.length === 0) {
      availableYears.push(currentYear);
    }
    availableYears.sort((a, b) => b - a);

    return NextResponse.json({
      success: true,
      data: {
        applications: applications.map((app) => ({
          submissionId: app.submissionId,
          profileId: app.profileId,
          status: app.status as ApplicationStatus,
          applicantType:
            app.applicantType === "SPES_BABY"
              ? ("spes_baby" as ApplicantType)
              : ("new" as ApplicantType),
          hasReview: app._count.reviews > 0,
          submittedAt: app.submittedAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          applicant: {
            firstName: app.profile.profileFirstName,
            lastName: app.profile.profileLastName,
            email: app.profile.user.email,
          },
        })),
        availableYears,
        selectedYear,
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
