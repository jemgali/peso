/**
 * User role constants
 */
export const USER_ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CLIENT: "client",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/**
 * Role display labels
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.EMPLOYEE]: "Employee",
  [USER_ROLES.CLIENT]: "Client",
}

/**
 * Roles available for selection in forms (excludes admin)
 */
export const SELECTABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: USER_ROLES.EMPLOYEE, label: USER_ROLE_LABELS.employee },
  { value: USER_ROLES.CLIENT, label: USER_ROLE_LABELS.client },
]
