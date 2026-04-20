import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  ADMIN_SERVICE_COOKIE,
  type AdminService,
  isAdminService,
} from "@/lib/constants/admin-service"

export async function requireAdminService(): Promise<AdminService> {
  const cookieStore = await cookies()
  const selectedService = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value

  if (!isAdminService(selectedService)) {
    redirect("/protected/admin/programs")
  }

  return selectedService
}

export async function requireSpesService(): Promise<void> {
  const service = await requireAdminService()

  if (service !== "spes") {
    redirect("/protected/admin/programs")
  }
}
