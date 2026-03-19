import React from 'react'
import Image from "next/image"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { Separator } from '@/ui/separator'
import SignInForm from '@/forms/auth/sign-in-form'

const SignInContent = () => {
  return (
    <section className="w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden shadow-lg border-0 md:border">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-5/12 bg-muted/30 p-8 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-6">
              <Image 
                src="/assets/peso_logo.png" 
                alt="PESO Logo" 
                fill
                className="object-contain drop-shadow-sm"
                sizes="(max-width: 768px) 128px, 128px"
                priority
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-primary">PESO Baguio</h2>
              <p className="text-sm text-muted-foreground text-balance">
                Public Employment Service Office
              </p>
            </div>
          </aside>
          <Separator orientation="vertical" />
          <main className="w-full md:w-7/12 p-6 md:p-8 lg:p-12 bg-background flex flex-col justify-center space-y-4">
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-bold">Login</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <SignInForm />
            </CardContent>
          </main>
        </div>
      </Card>
    </section>
  )
}

export default SignInContent