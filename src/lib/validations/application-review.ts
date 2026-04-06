import { z } from "zod";

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
  submissionNumber: number;
  submittedAt: string;
  updatedAt: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ApplicationListResponse {
  success: boolean;
  data?: {
    applications: ApplicationListItem[];
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
      submissionNumber: number;
      submittedAt: string;
      updatedAt: string;
    };
    profile: {
      profileId: string;
      profileLastName: string;
      profileFirstName: string;
      profileMiddleName: string | null;
      profileSuffix: string | null;
      profileRole: string;
    };
    personal: Record<string, unknown> | null;
    address: Record<string, unknown> | null;
    family: Record<string, unknown> | null;
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

export interface ClientApplicationStatusResponse {
  success: boolean;
  data?: {
    hasApplication: boolean;
    submission?: {
      submissionId: string;
      status: ApplicationStatus;
      submissionNumber: number;
      submittedAt: string;
      updatedAt: string;
    };
    latestReview?: ReviewHistoryItem;
    reviewHistory?: ReviewHistoryItem[];
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
