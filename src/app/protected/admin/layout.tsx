import React from 'react'
import { cookies } from "next/headers"
import Header from '@/components/protected/header'
import Footer from '@/components/protected/footer'
import Side from '@/components/admin/side'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { requireAdmin } from '@/lib/utils/admin-auth'
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdmin()
  const cookieStore = await cookies()
  const selectedServiceValue = cookieStore.get(ADMIN_SERVICE_COOKIE)?.value
  const selectedService = isAdminService(selectedServiceValue)
    ? selectedServiceValue
    : undefined

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          <Side service={selectedService} />
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
