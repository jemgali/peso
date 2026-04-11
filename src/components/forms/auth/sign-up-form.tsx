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
import { TextField } from "@/components/shared"
import {
    FieldSet,
    FieldGroup,
    FieldSeparator,
} from "@/ui/field"
import { Button } from "@/ui/button"
import { Spinner } from '@/ui/spinner'

const signUpSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

const SignUpForm = () => {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [isGooglePending, setIsGooglePending] = useState(false)

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: SignUpFormValues) => {
        // Set placeholder name - user will provide their actual name in the application form
        await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: "User",
            callbackURL: "/auth/verified",
        }, {
            onRequest: () => {
                setIsPending(true)
            },
            onSuccess: () => {
                toast.success("Account created successfully.\nPlease check your email to verify your account.")
                setIsPending(false)
                router.push('/auth/sign-in')
            },
            onError: (ctx) => {
                toast.error(ctx.error.message || "Failed to create account.")
                setIsPending(false)
            }
        })
    }

    const handleGoogleSignUp = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/auth/verify-email",
        }, {
            onRequest: () => {
                setIsGooglePending(true)
            },
            onError: (ctx) => {
                toast.error(ctx.error.message || "Failed to sign up with Google.")
                setIsGooglePending(false)
            }
        })
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <FieldGroup>
            <FieldSet className="gap-3">
                <TextField
                    name="email"
                    label="Email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    disabled={isPending}
                    placeholder="user@example.com"
                    className="w-full"
                />
                <TextField
                    name="password"
                    label="Password"
                    type="password"
                    register={register}
                    error={errors.password?.message}
                    disabled={isPending}
                    className="w-full"
                />
            </FieldSet>

            <FieldSet className="flex flex-col gap-2 pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Spinner className='mr-2 h-4 w-4'/>
                            Registering...
                        </>
                    ) : (
                        "Register"
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
                    disabled={isPending || isGooglePending}
                    onClick={handleGoogleSignUp}
                >
                    {isGooglePending ? (
                        <>
                            <Spinner className='mr-2 h-4 w-4'/>
                            Signing up...
                        </>
                    ) : (
                        <>
                            <Image 
                                src="/svgs/google.svg" 
                                alt="Google" 
                                width={15} 
                                height={15} 
                                className="mr-2"
                            />
                            Sign up with Google
                        </>
                    )}
                </Button>
            </FieldSet>
        </FieldGroup>

        <div className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign in
            </Link>
        </div>
    </form>
  )
}

export default SignUpForm