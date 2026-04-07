import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const HomeContent = () => {
  return (
    <section id="home" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12 lg:gap-16">
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
            <Image 
              src="/assets/peso_logo.png" 
              alt="PESO Logo" 
              width={280} 
              height={280}
              className="relative size-56 object-contain md:size-64 lg:size-72"
              priority
            />
          </div>
          
          <div className="flex max-w-xl flex-col gap-6 text-center md:text-left">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Your Gateway to{' '}
                <span className="text-primary">Employment Opportunities</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                The Public Employment Service Office (PESO) Baguio connects job seekers 
                with employers, provides career guidance, and offers various government 
                employment programs to empower the workforce of the Cordillera region.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Apply Now
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#programs">
                  View Programs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeContent