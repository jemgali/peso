import React from 'react'
import PublicLayout from '@/components/public/layout'
import HomeContent from '@/components/public/landing/home-content'
import AboutSection from '@/components/public/landing/about-section'
import ProgramsSection from '@/components/public/landing/programs-section'
import ContactSection from '@/components/public/landing/contact-section'

const Page = () => {
  return (
    <PublicLayout fullWidth>
      <HomeContent />
      <AboutSection />
      <ProgramsSection />
      <ContactSection />
    </PublicLayout>
  )
}

export default Page