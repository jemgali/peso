import React from 'react'
import Header from '@/components/protected/header'
import Footer from '@/components/protected/footer'
import StaffSideNav from '@/components/staff/side-nav'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { requireStaff } from '@/lib/utils/staff-auth'
import AdminNotificationListener from '@/components/notifications/admin-notification-listener'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireStaff()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AdminNotificationListener />
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          {/* We wrap StaffSideNav in a sidebar-like structure or just use it directly if it's already a sidebar */}
          <div className="w-64 border-r bg-muted/10 hidden md:block">
            <StaffSideNav />
          </div>
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="h-full p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
