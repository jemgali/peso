import React from 'react'
import Header from '@/components/protected/header'
import Footer from '@/components/protected/footer'
import EmployeeSide from '@/components/employee/side'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { requireEmployee } from '@/lib/utils/employee-auth'
import AdminNotificationListener from '@/components/notifications/admin-notification-listener'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireEmployee()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AdminNotificationListener />
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          <EmployeeSide />
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
