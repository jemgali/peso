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
    FieldSet,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldError,
} from "@/ui/field"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Spinner } from '@/ui/spinner'

const signUpSchema = z.object({
    last_name: z.string().min(1, "Last name is required."),
    first_name: z.string().min(1, "First name is required."),
    middle_name: z.string().optional(),
    suffix: z.string().optional(),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

const SignUpForm = () => {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            last_name: "",
            first_name: "",
            middle_name: "",
            suffix: "",
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: SignUpFormValues) => {
        const fullName = [data.first_name, data.middle_name, data.last_name, data.suffix]
            .filter(Boolean)
            .join(" ")
        
        await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: fullName,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <FieldGroup>
            <FieldSet className="gap-3">
                <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
                    <Field className="md:col-span-3" data-invalid={!!errors.last_name}>
                        <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                        <Input 
                            {...register("last_name")}
                            type="text"
                            id="last_name"
                            disabled={isPending}
                            autoComplete="family-name"
                            autoCapitalize="words"
                            placeholder="eg. Dela Cruz"
                            aria-invalid={!!errors.last_name}
                        />
                        {errors.last_name && <FieldError>{errors.last_name.message}</FieldError>}
                    </Field>
                    <Field className="md:col-span-3" data-invalid={!!errors.first_name}>
                        <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                        <Input 
                            {...register("first_name")}
                            type="text"
                            id="first_name"
                            disabled={isPending}
                            autoComplete="given-name"
                            autoCapitalize="words"
                            placeholder="eg. Juan"
                            aria-invalid={!!errors.first_name}
                        />
                        {errors.first_name && <FieldError>{errors.first_name.message}</FieldError>}
                    </Field>
                    <Field className="md:col-span-3" data-invalid={!!errors.middle_name}>
                        <FieldLabel htmlFor="middle_name">Middle Name</FieldLabel>
                        <Input 
                            {...register("middle_name")}
                            type="text"
                            id="middle_name"
                            disabled={isPending}
                            autoComplete="additional-name"
                            autoCapitalize="words"
                            placeholder="eg. Antonio"
                            aria-invalid={!!errors.middle_name}
                        />
                        {errors.middle_name && <FieldError>{errors.middle_name.message}</FieldError>}
                    </Field>
                    <Field className="md:col-span-3" data-invalid={!!errors.suffix}>
                        <FieldLabel htmlFor="suffix">Suffix</FieldLabel>
                        <Input 
                            {...register("suffix")}
                            type="text"
                            id="suffix"
                            disabled={isPending}
                            autoComplete="honorific-suffix"
                            autoCapitalize="words"
                            placeholder="eg. Jr"
                            aria-invalid={!!errors.suffix}
                        />
                        {errors.suffix && <FieldError>{errors.suffix.message}</FieldError>}
                    </Field>
                </div>
            </FieldSet>
            <FieldSet className="gap-3">
                <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input 
                        {...register("email")}
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input 
                        {...register("password")}
                        type="password"
                        id="password"
                        disabled={isPending}
                        autoComplete='new-password'
                        className="w-full"
                        aria-invalid={!!errors.password}
                    />
                    {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>
            </FieldSet>

            <FieldSet className="space-y-2 pt-4">
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
                >
                    <Image 
                        src="/svgs/google.svg" 
                        alt="Google" 
                        width={15} 
                        height={15} 
                        className="mr-2"
                    />
                    Sign up with Google
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