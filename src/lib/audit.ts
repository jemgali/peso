import { prisma as db } from "@/lib/prisma"
import { createId } from "@paralleldrive/cuid2"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "NOTIFY" | "EXPORT"

export interface AuditDetails {
  before?: unknown
  after?: unknown
  message?: string
  [key: string]: unknown
}

export async function logAudit(params: {
  userId?: string
  action: AuditAction
  entity: string
  entityId?: string
  details?: AuditDetails
  ipAddress?: string
  userAgent?: string
}) {
  try {
    // @ts-ignore - Temporary bypass until prisma generate is run
    await (db as any).auditLog.create({
      data: {
        id: `al_${createId()}`,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details as any, // Cast to any for Prisma Json compatibility
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error)
    // We don't want to crash the main request if audit logging fails,
    // but in a production app we might want to retry or alert.
  }
}
