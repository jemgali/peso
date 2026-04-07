/**
 * Application submission status constants
 */
export const APPLICATION_STATUS = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  NEEDS_REVISION: "needs_revision",
  REJECTED: "rejected",
} as const

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS]

/**
 * Status display labels
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.PENDING]: "Pending",
  [APPLICATION_STATUS.IN_REVIEW]: "In Review",
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.NEEDS_REVISION]: "Needs Revision",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
}

/**
 * Status badge variants for UI
 */
export const APPLICATION_STATUS_VARIANTS: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [APPLICATION_STATUS.PENDING]: "secondary",
  [APPLICATION_STATUS.IN_REVIEW]: "outline",
  [APPLICATION_STATUS.APPROVED]: "default",
  [APPLICATION_STATUS.NEEDS_REVISION]: "secondary",
  [APPLICATION_STATUS.REJECTED]: "destructive",
}

/**
 * Program status constants
 */
export const PROGRAM_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const

export type ProgramStatus = (typeof PROGRAM_STATUS)[keyof typeof PROGRAM_STATUS]

/**
 * Review decision constants
 */
export const REVIEW_DECISION = {
  APPROVED: "approved",
  NEEDS_REVISION: "needs_revision",
  REJECTED: "rejected",
} as const

export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION]

/**
 * Event type constants
 */
export const EVENT_TYPE = {
  ANNOUNCEMENT: "announcement",
  SCHEDULE: "schedule",
  DEADLINE: "deadline",
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EVENT_TYPE.ANNOUNCEMENT]: "Announcement",
  [EVENT_TYPE.SCHEDULE]: "Schedule",
  [EVENT_TYPE.DEADLINE]: "Deadline",
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  [EVENT_TYPE.ANNOUNCEMENT]: "bg-blue-500",
  [EVENT_TYPE.SCHEDULE]: "bg-green-500",
  [EVENT_TYPE.DEADLINE]: "bg-red-500",
}
