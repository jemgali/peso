import React from 'react'
import Header from './header'
import Footer from './footer'

interface PublicLayoutProps {
  children: React.ReactNode
  /** Whether to use full-width container or constrained */
  fullWidth?: boolean
}

const PublicLayout = ({ children, fullWidth = false }: PublicLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className={fullWidth ? "flex-1" : "container mx-auto flex-1 px-4"}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
