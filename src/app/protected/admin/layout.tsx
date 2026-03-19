import React from 'react'
import Header from '@/protected/header'
import Footer from '@/protected/footer'
import Side from '@/components/admin/side'
import { SidebarProvider, SidebarInset } from '@/ui/sidebar'

const Layout = ({ children, }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="shrink-0 z-50">
        <Header />
      </div>
      <div className="flex-1 relative overflow-hidden flex">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          <Side />
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="h-full p-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <div className="shrink-0 z-50">
        <Footer />
      </div>
    </div>
  )
}

export default Layout