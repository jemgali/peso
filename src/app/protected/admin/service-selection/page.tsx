import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/utils/admin-auth"

export default async function AdminServiceSelectionPage() {
  await requireAdmin()
  redirect("/protected/admin/programs")
}
