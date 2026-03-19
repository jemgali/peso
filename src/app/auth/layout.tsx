import React from 'react'
import Header from '@/public/header'
import Footer from "@/public/footer"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="relative flex flex-col min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/backgrounds/baguio_city_hall_bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-0 pointer-events-none" />

      <div className="relative shrink-0 z-50">
        <Header />
      </div>
      
      <main className="relative flex-1 flex items-center justify-center w-full p-4 md:p-8 z-10">
        {children}
      </main>
      
      <div className="relative shrink-0 z-50">
        <Footer />
      </div>
    </div>
  )
}

export default Layout