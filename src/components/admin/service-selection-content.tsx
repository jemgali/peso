"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Search, Briefcase, Users, FileCheck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { type AdminService } from "@/lib/constants/admin-service"
import { cn } from "@/lib/utils"

interface Program {
  id: string
  title: string
  description: string | null
  image: string | null
  status: string
}

interface ServiceSelectionContentProps {
  initialPrograms: Program[]
}

const DEFAULT_PROGRAMS = [
  {
    value: "spes" as AdminService,
    title: "SPES",
    description: "Special Program for Employment of Students",
    icon: GraduationCap,
    tags: ["Employment", "Education"],
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
]

export default function ServiceSelectionContent({ initialPrograms }: ServiceSelectionContentProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSelect = async (service: AdminService) => {
    setIsPending(service)

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

      toast.success(`${service.toUpperCase()} workspace activated`)
      router.refresh()
      router.push("/protected/admin/applications")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to select service")
      setIsPending(null)
    }
  }

  const filteredPrograms = useMemo(() => {
    return DEFAULT_PROGRAMS.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search programs..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((option) => (
          <Card key={option.value} className="group relative flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <div className={cn("h-2 w-full", option.bg)} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={cn("rounded-lg p-3", option.bg, option.color)}>
                  <option.icon className="size-6" />
                </div>
                <Badge variant="outline" className="font-normal">
                  Active
                </Badge>
              </div>
              <CardTitle className="mt-4 text-xl">{option.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {option.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-muted/50 text-[10px] uppercase tracking-wider">
                  {tag}
                </Badge>
              ))}
            </CardContent>
            <CardFooter className="mt-auto border-t bg-muted/30 pt-6">
              <Button
                className="w-full transition-all group-hover:bg-primary"
                onClick={() => handleSelect(option.value)}
                disabled={isPending !== null && isPending !== option.value}
              >
                {isPending === option.value ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <FileCheck data-icon="inline-start" className="size-4" />
                )}
                Manage Workspace
              </Button>
            </CardFooter>
          </Card>
        ))}

      </div>

      {filteredPrograms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No programs found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  )
}
