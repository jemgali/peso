"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Briefcase, GraduationCap, Hammer, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  getAdminServiceLabel,
  isAdminService,
  type AdminService,
} from "@/lib/constants/admin-service"

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
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)
  const status = searchParams.get("status")
  const workspace = searchParams.get("workspace")
  const selectedWorkspace = isAdminService(workspace) ? workspace : null
  const showComingSoonNotice = status === "coming-soon" && !!selectedWorkspace

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

      if (service === "spes") {
        router.push("/protected/admin/applications")
        return
      }

      setIsPending(false)
      router.push(`/protected/admin/programs?status=coming-soon&workspace=${service}`)
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

      {showComingSoonNotice && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{getAdminServiceLabel(selectedWorkspace)} workspace</AlertTitle>
          <AlertDescription>
            This admin workflow is not implemented yet. You can still switch to another program/service.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_OPTIONS.map((option) => (
          <Card key={option.value} className="flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <option.icon className="size-6" />
              </div>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                onClick={() => handleSelect(option.value)}
                disabled={isPending}
              >
                {isPending && <Spinner data-icon="inline-start" />}
                Open {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
