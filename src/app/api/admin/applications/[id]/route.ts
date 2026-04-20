import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  ApplicantType,
  ApplicationDetailResponse,
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApplicationDetailResponse>> {
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

    // Fetch full application data
    const submission = await prisma.applicationSubmission.findUnique({
      where: { submissionId },
      include: {
        profile: {
          include: {
            personal: true,
            address: true,
            family: true,
            siblings: {
              orderBy: { siblingOrder: "asc" },
            },
            guardian: true,
            benefactor: true,
            education: true,
            skills: true,
            documents: true,
            spes: true,
          },
        },
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
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formatFieldFeedback = (feedback: typeof submission.reviews[0]["fieldFeedback"]): FieldFeedback[] =>
      feedback.map((f) => ({
        sectionId: f.sectionId,
        fieldName: f.fieldName,
        status: f.status as "valid" | "invalid",
        comment: f.comment ?? undefined,
      }));

    const formatDocumentFeedback = (feedback: typeof submission.reviews[0]["documentFeedback"]): DocumentFeedback[] =>
      feedback.map((f) => ({
        documentType: f.documentType,
        status: f.status as "valid" | "invalid" | "missing",
        comment: f.comment ?? undefined,
      }));

    return NextResponse.json({
      success: true,
      data: {
        submission: {
          submissionId: submission.submissionId,
          profileId: submission.profileId,
          status: submission.status as ApplicationStatus,
          applicantType:
            submission.applicantType === "SPES_BABY"
              ? ("spes_baby" as ApplicantType)
              : ("new" as ApplicantType),
          submittedAt: submission.submittedAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        },
        profile: {
          profileId: submission.profile.profileId,
          profileLastName: submission.profile.profileLastName,
          profileFirstName: submission.profile.profileFirstName,
          profileMiddleName: submission.profile.profileMiddleName,
          profileSuffix: submission.profile.profileSuffix,
          profileEmail: submission.profile.profileEmail,
        },
        personal: submission.profile.personal as Record<string, unknown> | null,
        address: submission.profile.address as Record<string, unknown> | null,
        family: submission.profile.family as Record<string, unknown> | null,
        siblings: submission.profile.siblings.map((sibling) => ({
          siblingId: sibling.siblingId,
          name: sibling.siblingName,
          age: sibling.siblingAge,
          occupation: sibling.siblingOccupation,
          order: sibling.siblingOrder,
        })),
        guardian: submission.profile.guardian as Record<string, unknown> | null,
        benefactor: submission.profile.benefactor as Record<string, unknown> | null,
        education: submission.profile.education as Record<string, unknown> | null,
        skills: submission.profile.skills as Record<string, unknown> | null,
        documents: submission.profile.documents as Record<string, unknown> | null,
        spes: submission.profile.spes as Record<string, unknown> | null,
        reviews: submission.reviews.map((review) => ({
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
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching application detail:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
