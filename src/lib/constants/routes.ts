/**
 * Application route paths
 */
export const ROUTES = {
  // Public routes
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  VERIFIED: "/auth/verified",

  // Admin routes
  ADMIN: {
    DASHBOARD: "/protected/admin",
    PROGRAMS: "/protected/admin/programs",
    ANNOUNCEMENTS: "/protected/admin/announcements",
    APPLICATIONS: "/protected/admin/applications",
    EVALUATION: "/protected/admin/evaluation",
    BATCHES: "/protected/admin/batches",
    SCHEDULE: "/protected/admin/schedule",
    USERS: "/protected/admin/users",
    REPORTS: "/protected/admin/reports",
    SERVICE_SELECTION: "/protected/admin/programs",
  },

  // Client routes
  CLIENT: {
    DASHBOARD: "/protected/client",
    APPLICATION: "/protected/client/application",
    APPLICATION_SPES: "/protected/client/application",
    APPLICATION_GIP: "/protected/client/application/gip",
    APPLICATION_DILP: "/protected/client/application/dilp",
    DOCUMENTS: "/protected/client/application/documents",
  },

  // Employee routes
  EMPLOYEE: {
    DASHBOARD: "/protected/employee",
  },

  // API routes
  API: {
    AUTH: "/api/auth",
    ADMIN: {
      USERS: "/api/admin/users",
      PROGRAMS: "/api/admin/programs",
      SCHEDULE: "/api/admin/schedule",
      APPLICATIONS: "/api/admin/applications",
      SERVICE_CONTEXT: "/api/admin/service-context",
      SPES: {
        EVALUATION_SETTINGS: "/api/admin/spes/evaluation-settings",
        BATCHES: "/api/admin/spes/batches",
        WORKFLOWS: "/api/admin/spes/workflows",
        WORKFLOWS_BULK_STATUS: "/api/admin/spes/workflows/bulk-status",
        WORKFLOWS_BULK_ASSIGNMENT: "/api/admin/spes/workflows/bulk-assignment",
        WORKFLOWS_NOTIFY: "/api/admin/spes/workflows/notify",
      },
    },
    CLIENT: {
      APPLICATION: "/api/client/application",
    },
    UPLOAD: "/api/upload",
    SEND: "/api/send",
    NOTIFICATIONS: "/api/notifications",
  },
} as const

/**
 * Get dynamic route with parameter substitution
 */
export function getRoute(
  route: string,
  params: Record<string, string | number>
): string {
  let result = route
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`[${key}]`, String(value))
  }
  return result
}

/**
 * Check if current path matches a route pattern
 */
export function matchesRoute(currentPath: string, route: string): boolean {
  // Exact match for base routes
  if (currentPath === route) return true
  // Prefix match for nested routes
  return currentPath.startsWith(route + "/")
}
