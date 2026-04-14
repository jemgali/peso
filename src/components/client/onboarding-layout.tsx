import React from "react"
import Header from "@/components/protected/header"
import Footer from "@/components/protected/footer"
import { Briefcase } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarShell } from "@/components/shared/sidebar-shell"

/**
 * Onboarding layout: Header + Footer + empty sidebar shell (no nav links).
 * Used during forced profile setup to prevent access to other pages.
 */
const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          <SidebarShell title="PESO Portal" icon={Briefcase}>
            <></>
          </SidebarShell>
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="h-full p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  )
}

export default OnboardingLayout
