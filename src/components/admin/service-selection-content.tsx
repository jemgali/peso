"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, GraduationCap, Hammer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import type { AdminService } from "@/lib/constants/admin-service"

const SERVICE_OPTIONS: Array<{
  value: AdminService
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    value: "spes",
    title: "SPES",
    description: "Special Program for Employment of Students",
    icon: GraduationCap,
  },
  {
    value: "gip",
    title: "GIP",
    description: "Government Internship Program",
    icon: Briefcase,
  },
  {
    value: "dilp",
    title: "DILP",
    description: "DOLE Integrated Livelihood Program",
    icon: Hammer,
  },
]

export default function ServiceSelectionContent() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleSelect = async (service: AdminService) => {
    setIsPending(true)

    try {
      const response = await fetch("/api/admin/service-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save service context")
      }

      router.push("/protected/admin")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to select service")
      setIsPending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Select Program/Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which workspace you want to open for this admin session.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_OPTIONS.map((option) => (
          <Card
            key={option.value}
            className="flex flex-col items-center gap-3 p-5 text-center"
          >
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <option.icon className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">{option.title}</h2>
            <p className="text-sm text-muted-foreground">{option.description}</p>
            <Button
              className="mt-auto w-full"
              onClick={() => handleSelect(option.value)}
              disabled={isPending}
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Open {option.title}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

