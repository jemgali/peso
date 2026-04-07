import React from 'react'
import Image from 'next/image'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import SignUpForm from '@/components/forms/auth/sign-up-form'

const SignUpContent = () => {
  return (
    <section className="flex w-full items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden border-0 shadow-lg md:border">
        <div className="flex flex-col md:flex-row">
          <aside className="flex w-full flex-col items-center justify-center bg-muted/30 p-8 md:w-5/12">
            <div className="relative mb-6 size-32">
              <Image 
                src="/assets/peso_logo.png" 
                alt="PESO Logo" 
                fill
                className="object-contain drop-shadow-sm"
                sizes="128px"
                priority
              />
            </div>
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                PESO Baguio
              </h2>
              <CardDescription className="text-balance">
                Join us to access employment programs and services
              </CardDescription>
            </div>
          </aside>
          <Separator orientation="vertical" className="hidden md:block" />
          <main className="flex w-full flex-col justify-center gap-4 bg-background p-6 md:w-7/12 md:p-8 lg:p-12">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Sign up to start your application
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <SignUpForm />
            </CardContent>
          </main>
        </div>
      </Card>
    </section>
  )
}

export default SignUpContent