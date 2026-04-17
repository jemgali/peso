import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { requireUser } from "@/lib/utils/user-auth"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"

export default async function ProtectedEntryPage() {
  const user = await requireUser()

  if (user.role === "admin") {
    const cookieStore = await cookies()
    const selectedService = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value

    if (!isAdminService(selectedService)) {
      redirect("/protected/service-selection")
    }

    redirect("/protected/admin")
  }

  if (user.role === "employee") {
    redirect("/protected/employee")
  }

  redirect("/protected/client")
}

