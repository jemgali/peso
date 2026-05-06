import React from "react"
import Header from "@/components/protected/header"
import Footer from "@/components/protected/footer"
import { requireUser } from "@/lib/utils/user-auth"

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto bg-muted/10">
        <div className="w-full max-w-screen-2xl mx-auto py-8 px-4 md:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
