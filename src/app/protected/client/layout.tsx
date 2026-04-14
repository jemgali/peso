import React from "react"
import Header from "@/components/protected/header"
import Footer from "@/components/protected/footer"
import Side from "@/components/client/side"
import OnboardingLayout from "@/components/client/onboarding-layout"
import ProfileSetup from "@/components/client/content/profile-setup"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { requireUser } from "@/lib/utils/user-auth"
import { PrismaClient } from "@/generated/prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await requireUser()

  // Check if user has completed onboarding (profileFirstName exists)
  const profileUser = await prisma.profileUser.findUnique({
    where: { userId: user.id },
    select: { profileFirstName: true, profileEmail: true },
  })

  const needsOnboarding = !profileUser?.profileFirstName

  if (needsOnboarding) {
    const email = profileUser?.profileEmail || user.email
    return (
      <OnboardingLayout>
        <ProfileSetup userEmail={email} />
      </OnboardingLayout>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider className="absolute inset-0 h-full min-h-0 w-full">
          <Side />
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="h-full p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
