import React from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Users, Target, Handshake } from 'lucide-react'

const highlights = [
  {
    icon: Users,
    title: 'Job Matching',
    description: 'We connect qualified job seekers with employers looking for talent.',
  },
  {
    icon: Target,
    title: 'Career Guidance',
    description: 'Professional counseling to help you find the right career path.',
  },
  {
    icon: Handshake,
    title: 'Employment Programs',
    description: 'Access to government programs like SPES, GIP, TUPAD, and more.',
  },
]

const partnerLogos = [
  { src: '/assets/peso_logo.png', alt: 'PESO Logo' },
  { src: '/assets/spes_logo.png', alt: 'SPES Logo' },
  { src: '/assets/dole_logo.png', alt: 'DOLE Logo' },
]

const AboutSection = () => {
  return (
    <section id="about" className="scroll-mt-20 bg-section-alt py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            About PESO Baguio
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            The Public Employment Service Office serves as the frontline agency 
            mandated to facilitate employment services for the City of Baguio and 
            surrounding municipalities.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex flex-1 flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-1">
              {highlights.map((item) => (
                <Card key={item.title} className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xs shrink-0 lg:max-w-sm">
            <Carousel
              orientation="vertical"
              opts={{
                loop: true,
                align: 'center',
              }}
              className="w-full"
            >
              <CarouselContent className="h-80">
                {partnerLogos.map((logo) => (
                  <CarouselItem key={logo.alt} className="basis-[70%] py-2">
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-background p-6 shadow-sm">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={180}
                        height={180}
                        className="size-40 object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection