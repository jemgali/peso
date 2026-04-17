export const ADMIN_SERVICES = ["spes", "gip", "dilp"] as const

export type AdminService = (typeof ADMIN_SERVICES)[number]

export const ADMIN_SERVICE_COOKIE = "admin_service_context"

export function isAdminService(value: string | undefined | null): value is AdminService {
  return !!value && ADMIN_SERVICES.includes(value as AdminService)
}

export function getAdminServiceLabel(service: AdminService): string {
  if (service === "spes") return "SPES"
  if (service === "gip") return "GIP"
  return "DILP"
}

