import React from 'react'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import SignUpForm from '@/components/forms/auth/sign-up-form'

const SignUpContent = () => {
  return (
    <section className="w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl overflow-hidden shadow-lg border-0 md:border">
        <div className="p-6 md:p-8 lg:p-12 bg-background flex flex-col justify-center space-y-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SignUpForm />
          </CardContent>
        </div>
      </Card>
    </section>
  )
}

export default SignUpContent