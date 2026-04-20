import { redirect } from "next/navigation"
import { requireUser } from "@/lib/utils/user-auth"

export default async function ProtectedEntryPage() {
  const user = await requireUser()

  if (user.role === "admin") {
    redirect("/protected/admin")
  }

  if (user.role === "employee") {
    redirect("/protected/employee")
  }

  redirect("/protected/client")
}
