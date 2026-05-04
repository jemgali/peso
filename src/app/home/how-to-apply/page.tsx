import React from "react"
import PublicLayout from "@/components/public/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  "Create a PESO account and verify your email.",
  "Complete your client profile and personal information.",
  "Prepare required supporting documents for SPES.",
  "Submit your application and monitor status updates in your dashboard.",
]

export default function HowToApplyPage() {
  return (
    <PublicLayout fullWidth>
      <section className="py-16 md:py-24">
        <div className="container mx-auto flex flex-col gap-8 px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">How to Apply</h1>
            <p className="mt-3 text-muted-foreground">
              Follow these steps to submit your PESO application successfully.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Guide</CardTitle>
              <CardDescription>
                This is a placeholder guide page and can be expanded with detailed requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
