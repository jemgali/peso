"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { 
    Field,
    FieldGroup,
    FieldSet,
    FieldLabel,
    FieldSeparator,
    FieldError,
} from "@/ui/field"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
})

type SignInFormValues = z.infer<typeof signInSchema>

const SignInForm = () => {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: SignInFormValues) => {
        await authClient.signIn.email({
            email: data.email,
            password: data.password,
        }, {
            onRequest: () => {
                setIsPending(true)
            },
            onSuccess: () => {
                toast.success("Successfully signed in.")
                setIsPending(false)
                router.push("/")
            },
            onError: (ctx) => {
                toast.error(ctx.error.message || "Invalid email or password.")
                setIsPending(false)
            }
        })
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        <FieldGroup>
            <FieldSet className="gap-4">
                <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input 
                        { ...register("email")}
                        type="email" 
                        id="email" 
                        disabled={isPending}
                        autoComplete="email" 
                        placeholder="user@example.com"
                        className="w-full"
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>
                <Field data-invalid={!!errors.password}>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Link 
                            href="/auth/forgot-password" 
                            className="text-sm font-medium text-primary hover:underline underline-offset-4"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        {...register("password")}
                        type="password" 
                        id="password" 
                        disabled={isPending}
                        autoComplete="current-password"
                        className="w-full"
                        aria-invalid={!!errors.password}
                    />
                    {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>
                <FieldSet className="space-y-2 pt-2">
                    <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner className='mr-2 h-4 w-4'/>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <FieldSeparator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        size="lg"
                    >
                        <Image 
                            src="/svgs/google.svg" 
                            alt="Google" 
                            width={15} 
                            height={15} 
                            className="mr-2"
                        />
                        Sign in with Google
                    </Button>
                </FieldSet>

            </FieldSet>
        </FieldGroup>

        <div className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign up
            </Link>
        </div>
    </form>
  )
}

export default SignInForm