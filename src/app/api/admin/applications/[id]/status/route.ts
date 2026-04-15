import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { auth } from "@/lib/auth";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/validations/application-review";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const updateStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface StatusUpdateResponse {
  success: boolean;
  message?: string;
  data?: {
    submissionId: string;
    status: ApplicationStatus;
    updatedAt: string;
  };
  error?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<StatusUpdateResponse>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", "),
        },
        { status: 400 },
      );
    }

    const submission = await prisma.applicationSubmission.findUnique({
      where: { submissionId },
      select: {
        submissionId: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 },
      );
    }

    if (submission.status === validationResult.data.status) {
      return NextResponse.json({
        success: true,
        message: "Application status unchanged",
        data: {
          submissionId: submission.submissionId,
          status: submission.status as ApplicationStatus,
          updatedAt: submission.updatedAt.toISOString(),
        },
      });
    }

    const updatedSubmission = await prisma.applicationSubmission.update({
      where: { submissionId },
      data: { status: validationResult.data.status },
      select: {
        submissionId: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application status updated",
      data: {
        submissionId: updatedSubmission.submissionId,
        status: updatedSubmission.status as ApplicationStatus,
        updatedAt: updatedSubmission.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
