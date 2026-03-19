import React from 'react'
import Header from "@/public/header"
import Footer from "@/public/footer"
import HomeContent from '@/public/landing/home-content'
import AboutSection from '@/public/landing/about-section'
import ProgramsSection from '@/public/landing/programs-section'
import ContactSection from '@/public/landing/contact-section'

const Page = () => {
  return (
    <>
      <Header />
        <HomeContent />
        <AboutSection />
        <ProgramsSection />
        <ContactSection />
      <Footer />
    </>
  )
}

export default Page