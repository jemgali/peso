import React from "react"
import { notFound } from "next/navigation"
import PublicLayout from "@/components/public/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PROGRAM_PLACEHOLDERS = {
  spes: {
    title: "SPES",
    subtitle: "Special Program for Employment of Students",
    content:
      "This placeholder page will contain complete SPES eligibility, requirements, timelines, and process details.",
  },
  gip: {
    title: "GIP",
    subtitle: "Government Internship Program",
    content:
      "This placeholder page will contain full internship guidelines, qualifications, and onboarding instructions.",
  },
  nsrp: {
    title: "NSRP",
    subtitle: "National Skills Registration Program",
    content:
      "This placeholder page will explain NSRP registration flow, profiling requirements, and matching steps.",
  },
  dilp: {
    title: "DILP",
    subtitle: "DOLE Integrated Livelihood Program",
    content:
      "This placeholder page will include livelihood grant requirements, proposal guidelines, and release process.",
  },
  jobstart: {
    title: "Jobstart",
    subtitle: "Jobstart Program",
    content:
      "This placeholder page will cover Jobstart training tracks, internships, and employer placement flow.",
  },
  tupad: {
    title: "TUPAD",
    subtitle: "Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers",
    content:
      "This placeholder page will contain TUPAD beneficiary criteria, documentary requirements, and deployment details.",
  },
} as const

type ProgramSlug = keyof typeof PROGRAM_PLACEHOLDERS

export function generateStaticParams() {
  return Object.keys(PROGRAM_PLACEHOLDERS).map((slug) => ({ slug }))
}

interface ProgramPlaceholderPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProgramPlaceholderPage({
  params,
}: ProgramPlaceholderPageProps) {
  const { slug } = await params
  const key = slug as ProgramSlug
  const program = PROGRAM_PLACEHOLDERS[key]

  if (!program) {
    notFound()
  }

  return (
    <PublicLayout fullWidth>
      <section className="py-16 md:py-24">
        <div className="container mx-auto flex flex-col gap-8 px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{program.title}</h1>
            <p className="mt-3 text-muted-foreground">{program.subtitle}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>Placeholder content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{program.content}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
