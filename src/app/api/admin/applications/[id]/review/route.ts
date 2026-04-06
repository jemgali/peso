import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";
import {
  submitReviewSchema,
  type SubmitReviewResponse,
  type ApplicationStatus,
} from "@/lib/validations/application-review";
import { sendApplicationReviewEmail } from "@/lib/email";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Map review decision to new application status
function getNewStatus(decision: string): ApplicationStatus {
  switch (decision) {
    case "approved":
      return "approved";
    case "needs_revision":
      return "needs_revision";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SubmitReviewResponse>> {
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

    const { id: submissionId } = await params;
    const reviewerId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = submitReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { decision, overallComments, fieldFeedback, documentFeedback } =
      validationResult.data;

    // Verify submission exists and is reviewable
    const submission = await prisma.applicationSubmission.findUnique({
      where: { submissionId },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if already in a final state
    if (submission.status === "approved" || submission.status === "rejected") {
      return NextResponse.json(
        { success: false, error: "Application already has a final decision" },
        { status: 400 }
      );
    }

    // Create review and update status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the review
      const reviewId = randomUUID();
      await tx.applicationReview.create({
        data: {
          reviewId,
          submissionId,
          reviewerId,
          decision,
          overallComments: overallComments || null,
        },
      });

      // Create field feedback entries
      if (fieldFeedback && fieldFeedback.length > 0) {
        await tx.reviewFieldFeedback.createMany({
          data: fieldFeedback.map((f) => ({
            feedbackId: randomUUID(),
            reviewId,
            sectionId: f.sectionId,
            fieldName: f.fieldName,
            status: f.status,
            comment: f.comment || null,
          })),
        });
      }

      // Create document feedback entries
      if (documentFeedback && documentFeedback.length > 0) {
        await tx.reviewDocumentFeedback.createMany({
          data: documentFeedback.map((f) => ({
            feedbackId: randomUUID(),
            reviewId,
            documentType: f.documentType,
            status: f.status,
            comment: f.comment || null,
          })),
        });
      }

      // Update submission status
      const newStatus = getNewStatus(decision);
      await tx.applicationSubmission.update({
        where: { submissionId },
        data: { status: newStatus },
      });

      // Create notification for the user
      const notificationTitle =
        decision === "approved"
          ? "Application Approved!"
          : decision === "needs_revision"
          ? "Application Needs Revision"
          : "Application Rejected";

      const notificationMessage =
        decision === "approved"
          ? "Congratulations! Your SPES application has been approved."
          : decision === "needs_revision"
          ? "Your SPES application requires some changes. Please review the feedback and resubmit."
          : "We regret to inform you that your SPES application has been rejected.";

      const notificationType =
        decision === "approved"
          ? "application_approved"
          : decision === "needs_revision"
          ? "application_revision"
          : "application_rejected";

      await tx.notification.create({
        data: {
          notificationId: randomUUID(),
          userId: submission.profile.userId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          link: "/protected/client/application/status",
        },
      });

      return { reviewId, newStatus };
    });

    // Send email notification
    const applicantName = `${submission.profile.profileFirstName} ${submission.profile.profileLastName}`;
    const applicantEmail = submission.profile.user.email;

    // Send email asynchronously (don't block the response)
    sendApplicationReviewEmail({
      to: applicantEmail,
      applicantName,
      submissionNumber: submission.submissionNumber,
      decision: decision as "approved" | "needs_revision" | "rejected",
      overallComments: overallComments || undefined,
      fieldFeedback: fieldFeedback || [],
      documentFeedback: documentFeedback || [],
    }).catch((error) => {
      console.error("Failed to send review email:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: {
        reviewId: result.reviewId,
        newStatus: result.newStatus,
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
