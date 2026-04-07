import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const programsData = [
  { 
    src: '/assets/dole_logo.png', 
    alt: 'Government Internship Program', 
    title: 'Government Internship Program (GIP)', 
    description: 'Provides work experience to fresh graduates in government agencies.',
    rounded: false, 
    link: '/home/services-programs/gip' 
  },
  { 
    src: '/assets/spes_logo.png', 
    alt: 'Special Programs for Employment of Students', 
    title: 'SPES', 
    description: 'Employment assistance for poor but deserving students during summer.',
    rounded: false, 
    link: '/home/services-programs/spes'  
  },
  { 
    src: '/assets/dole_logo.png', 
    alt: 'National Skills Registration Program', 
    title: 'NSRP', 
    description: 'Skills profiling and matching for better employment opportunities.',
    rounded: false, 
    link: '/home/services-programs/nsrp'  
  },
  { 
    src: '/assets/dilp_logo.png', 
    alt: 'DOLE Integrated Livelihood Program', 
    title: 'DILP', 
    description: 'Livelihood assistance for displaced workers and marginalized sectors.',
    rounded: false, 
    link: '/home/services-programs/dilp'  
  },
  { 
    src: '/assets/jobstart_logo.png', 
    alt: 'Jobstart', 
    title: 'Jobstart', 
    description: 'Life skills training and internship for young job seekers.',
    rounded: true, 
    link: '/home/services-programs/jobstart'  
  },
  { 
    src: '/assets/tupad_logo.jpg', 
    alt: 'TUPAD', 
    title: 'TUPAD', 
    description: 'Emergency employment for displaced or underemployed workers.',
    rounded: true, 
    link: '/home/services-programs/tupad'  
  },
]

const ProgramsSection = () => {
  return (
    <section id="programs" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Services & Programs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore the various employment programs and services offered by PESO Baguio 
            to help you find the right opportunity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programsData.map((program) => (
            <Link key={program.title} href={program.link} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="relative size-16 shrink-0">
                    <Image
                      src={program.src}
                      alt={program.alt}
                      fill
                      sizes="64px"
                      className={cn(
                        "object-contain transition-transform duration-300 group-hover:scale-110",
                        program.rounded && "rounded-lg"
                      )}
                    />
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {program.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {program.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Learn more
                    <ArrowRight className="ml-1 size-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProgramsSection