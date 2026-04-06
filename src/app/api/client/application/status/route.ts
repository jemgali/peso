import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  ClientApplicationStatusResponse,
  ApplicationStatus,
  ReviewDecision,
  FieldFeedback,
  DocumentFeedback,
} from "@/lib/validations/application-review";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export async function GET(): Promise<NextResponse<ClientApplicationStatusResponse>> {
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

    // Get user's profile
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          hasApplication: false,
        },
      });
    }

    // Get latest submission with reviews
    const submission = await prisma.applicationSubmission.findFirst({
      where: { profileId: profile.profileId },
      orderBy: { submittedAt: "desc" },
      include: {
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
            fieldFeedback: true,
            documentFeedback: true,
          },
          orderBy: { reviewedAt: "desc" },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({
        success: true,
        data: {
          hasApplication: false,
        },
      });
    }

    // Format feedback helpers
    const formatFieldFeedback = (
      feedback: typeof submission.reviews[0]["fieldFeedback"]
    ): FieldFeedback[] =>
      feedback.map((f) => ({
        sectionId: f.sectionId,
        fieldName: f.fieldName,
        status: f.status as "valid" | "invalid",
        comment: f.comment ?? undefined,
      }));

    const formatDocumentFeedback = (
      feedback: typeof submission.reviews[0]["documentFeedback"]
    ): DocumentFeedback[] =>
      feedback.map((f) => ({
        documentType: f.documentType,
        status: f.status as "valid" | "invalid" | "missing",
        comment: f.comment ?? undefined,
      }));

    // Format reviews
    const formattedReviews = submission.reviews.map((review) => ({
      reviewId: review.reviewId,
      decision: review.decision as ReviewDecision,
      overallComments: review.overallComments,
      reviewedAt: review.reviewedAt.toISOString(),
      reviewer: {
        name: review.reviewer.name,
        email: review.reviewer.email,
      },
      fieldFeedback: formatFieldFeedback(review.fieldFeedback),
      documentFeedback: formatDocumentFeedback(review.documentFeedback),
    }));

    return NextResponse.json({
      success: true,
      data: {
        hasApplication: true,
        submission: {
          submissionId: submission.submissionId,
          status: submission.status as ApplicationStatus,
          submissionNumber: submission.submissionNumber,
          submittedAt: submission.submittedAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        },
        latestReview: formattedReviews[0] || undefined,
        reviewHistory: formattedReviews,
      },
    });
  } catch (error) {
    console.error("Error fetching application status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
