import DashboardNotifications from "@/components/client/dashboard-notifications"
import { PageHeader } from "@/components/shared"

export default function ClientAnnouncementsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="Announcements"
        description="All your PESO notifications. Click any item to open the related page."
      />
      <DashboardNotifications />
    </div>
  )
}
