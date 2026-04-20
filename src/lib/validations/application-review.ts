import { z } from "zod";
import type {
  ExamResult,
  SpesSelectionStatus,
  SpesWorkflowStage,
} from "@/lib/validations/spes-workflow";

// Review decision values
export const REVIEW_DECISIONS = ["approved", "needs_revision", "rejected"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

// Application status values
export const APPLICATION_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "needs_revision",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICANT_TYPES = ["new", "spes_baby"] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

// Field feedback status values
export const FIELD_FEEDBACK_STATUSES = ["valid", "invalid"] as const;
export type FieldFeedbackStatus = (typeof FIELD_FEEDBACK_STATUSES)[number];

// Document feedback status values
export const DOCUMENT_FEEDBACK_STATUSES = ["valid", "invalid", "missing"] as const;
export type DocumentFeedbackStatus = (typeof DOCUMENT_FEEDBACK_STATUSES)[number];

// Notification type values
export const NOTIFICATION_TYPES = [
  "application_approved",
  "application_revision",
  "application_rejected",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Field feedback schema
export const fieldFeedbackSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  fieldName: z.string().min(1, "Field name is required"),
  status: z.enum(FIELD_FEEDBACK_STATUSES),
  comment: z.string().optional(),
});

// Document feedback schema
export const documentFeedbackSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  status: z.enum(DOCUMENT_FEEDBACK_STATUSES),
  comment: z.string().optional(),
});

// Submit review schema
export const submitReviewSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  overallComments: z.string().optional(),
  fieldFeedback: z.array(fieldFeedbackSchema).optional(),
  documentFeedback: z.array(documentFeedbackSchema).optional(),
});

// Type exports
export type FieldFeedback = z.infer<typeof fieldFeedbackSchema>;
export type DocumentFeedback = z.infer<typeof documentFeedbackSchema>;
export type SubmitReviewRequest = z.infer<typeof submitReviewSchema>;

// Response types
export interface ApplicationListItem {
  submissionId: string;
  profileId: string;
  status: ApplicationStatus;
  applicantType: ApplicantType;
  hasReview: boolean;
  submittedAt: string;
  updatedAt: string;
  applicant: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ApplicationListResponse {
  success: boolean;
  data?: {
    applications: ApplicationListItem[];
    availableYears: number[];
    selectedYear: number;
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

export interface ReviewHistoryItem {
  reviewId: string;
  decision: ReviewDecision;
  overallComments: string | null;
  reviewedAt: string;
  reviewer: {
    name: string;
    email: string;
  };
  fieldFeedback: FieldFeedback[];
  documentFeedback: DocumentFeedback[];
}

export interface ApplicationDetailResponse {
  success: boolean;
  data?: {
    submission: {
      submissionId: string;
      profileId: string;
      status: ApplicationStatus;
      applicantType: ApplicantType;
      submittedAt: string;
      updatedAt: string;
    };
    profile: {
      profileId: string;
      profileLastName: string | null;
      profileFirstName: string | null;
      profileMiddleName: string | null;
      profileSuffix: string | null;
      profileEmail: string | null;
    };
    personal: Record<string, unknown> | null;
    address: Record<string, unknown> | null;
    family: Record<string, unknown> | null;
    siblings?: Array<Record<string, unknown>>;
    guardian: Record<string, unknown> | null;
    benefactor: Record<string, unknown> | null;
    education: Record<string, unknown> | null;
    skills: Record<string, unknown> | null;
    documents: Record<string, unknown> | null;
    spes: Record<string, unknown> | null;
    reviews: ReviewHistoryItem[];
  };
  error?: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  message?: string;
  data?: {
    reviewId: string;
    newStatus: ApplicationStatus;
  };
  error?: string;
}

export interface WorkflowScheduleSummary {
  eventId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
}

export interface ClientSpesWorkflowStatus {
  workflowId: string;
  stage: SpesWorkflowStage;
  selectionStatus: SpesSelectionStatus;
  isGrantee: boolean;
  examResult: ExamResult;
  rankPosition: number | null;
  isWaitlisted: boolean;
  assignedOffice: string | null;
  batch: {
    batchId: string;
    batchName: string;
    officeName: string | null;
  } | null;
  schedules: {
    interview: WorkflowScheduleSummary | null;
    exam: WorkflowScheduleSummary | null;
    orientation: WorkflowScheduleSummary | null;
  };
}

export interface ClientApplicationStatusResponse {
  success: boolean;
  data?: {
    hasApplication: boolean;
    submission?: {
      submissionId: string;
      status: ApplicationStatus;
      submittedAt: string;
      updatedAt: string;
    };
    latestReview?: ReviewHistoryItem;
    reviewHistory?: ReviewHistoryItem[];
    profile?: Record<string, unknown> | null;
    personal?: Record<string, unknown> | null;
    address?: Record<string, unknown> | null;
    family?: Record<string, unknown> | null;
    siblings?: Array<Record<string, unknown>>;
    guardian?: Record<string, unknown> | null;
    benefactor?: Record<string, unknown> | null;
    education?: Record<string, unknown> | null;
    skills?: Record<string, unknown> | null;
    documents?: Record<string, unknown> | null;
    spes?: Record<string, unknown> | null;
    workflow?: ClientSpesWorkflowStatus | null;
  };
  error?: string;
}

export interface NotificationItem {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data?: {
    notifications: NotificationItem[];
    unreadCount: number;
  };
  error?: string;
}
