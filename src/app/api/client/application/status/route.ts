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
  WorkflowScheduleSummary,
} from "@/lib/validations/application-review";
import type { ExamResult, SpesWorkflowStage } from "@/lib/validations/spes-workflow";

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
        spesWorkflow: {
          include: {
            batch: {
              select: {
                batchId: true,
                batchName: true,
                officeName: true,
              },
            },
            interviewScheduleEvent: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                allDay: true,
              },
            },
            examScheduleEvent: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                allDay: true,
              },
            },
            orientationScheduleEvent: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                allDay: true,
              },
            },
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

    const formatScheduleSummary = (
      schedule:
        | {
            id: string;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
            allDay: boolean;
          }
        | null
        | undefined
    ): WorkflowScheduleSummary | null =>
      schedule
        ? {
            eventId: schedule.id,
            title: schedule.title,
            description: schedule.description,
            startDate: schedule.startDate.toISOString(),
            endDate: schedule.endDate?.toISOString() || null,
            allDay: schedule.allDay,
          }
        : null;

    const workflow = submission.spesWorkflow;
    const formattedWorkflow = workflow
        ? {
          workflowId: workflow.workflowId,
          stage: workflow.stage.toLowerCase() as SpesWorkflowStage,
          isGrantee: workflow.isGrantee,
          examResult: workflow.examResult.toLowerCase() as ExamResult,
          rankPosition: workflow.rankPosition,
          isWaitlisted: workflow.isWaitlisted,
          assignedOffice: workflow.assignedOffice,
          batch: workflow.batch
            ? {
                batchId: workflow.batch.batchId,
                batchName: workflow.batch.batchName,
                officeName: workflow.batch.officeName,
              }
            : null,
          schedules: {
            interview: formatScheduleSummary(workflow.interviewScheduleEvent),
            exam: formatScheduleSummary(workflow.examScheduleEvent),
            orientation: formatScheduleSummary(workflow.orientationScheduleEvent),
          },
        }
      : null;

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
        profile: profile as Record<string, unknown>,
        personal: profile.personal as Record<string, unknown> | null,
        address: profile.address as Record<string, unknown> | null,
        family: profile.family as Record<string, unknown> | null,
        siblings: profile.siblings.map((sibling) => ({
          siblingId: sibling.siblingId,
          name: sibling.siblingName,
          age: sibling.siblingAge,
          occupation: sibling.siblingOccupation,
          order: sibling.siblingOrder,
        })),
        guardian: profile.guardian as Record<string, unknown> | null,
        benefactor: profile.benefactor as Record<string, unknown> | null,
        education: profile.education as Record<string, unknown> | null,
        skills: profile.skills as Record<string, unknown> | null,
        documents: profile.documents as Record<string, unknown> | null,
        spes: profile.spes as Record<string, unknown> | null,
        workflow: formattedWorkflow,
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
