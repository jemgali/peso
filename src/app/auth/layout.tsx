import React from 'react'
import Header from '@/components/public/header'
import Footer from '@/components/public/footer'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="relative flex min-h-screen flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/backgrounds/baguio_city_hall_bg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-background/40 backdrop-blur-sm" />

      <div className="relative">
        <Header />
      </div>
      
      <main className="relative flex flex-1 items-center justify-center p-4 md:p-8">
        {children}
      </main>
      
      <div className="relative">
        <Footer />
      </div>
    </div>
  )
}

export default Layout