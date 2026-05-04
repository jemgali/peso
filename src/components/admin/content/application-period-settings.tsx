"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Switch } from "@/ui/switch"
import { Badge } from "@/ui/badge"
import { Spinner } from "@/ui/spinner"
import { Separator } from "@/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/ui/field"
import {
  CalendarClock,
  ChevronDown,
  Info,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PeriodData {
  periodId: string
  year: number
  isOpen: boolean
  openDate: string | null
  closeDate: string | null
  updatedAt: string
}

export default function ApplicationPeriodSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [period, setPeriod] = useState<PeriodData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [closeDate, setCloseDate] = useState("")
  const [expanded, setExpanded] = useState(false)

  const fetchPeriod = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/spes/application-period")
      const data = await res.json()
      if (data.success) {
        setPeriod(data.data)
        setIsOpen(data.data.isOpen)
        setCloseDate(
          data.data.closeDate
            ? new Date(data.data.closeDate).toISOString().slice(0, 16)
            : ""
        )
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load application period settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPeriod()
  }, [fetchPeriod])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/spes/application-period", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen,
          closeDate: closeDate || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update")
      }

      setPeriod(data.data)
      toast.success(
        isOpen
          ? "Applications are now open"
          : "Applications are now closed"
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border p-4">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }

  const hasUnsavedChanges =
    period && (isOpen !== period.isOpen || closeDate !== (period.closeDate ? new Date(period.closeDate).toISOString().slice(0, 16) : ""))

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="rounded-lg border">
        {/* Header — always visible */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">
                  Application Period — {period?.year || new Date().getFullYear()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Control when clients can submit new applications
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {period?.isOpen ? (
                <Badge variant="default">
                  <ShieldCheck data-icon="inline-start" />
                  Open
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <ShieldX data-icon="inline-start" />
                  Closed
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expandable settings panel */}
        <CollapsibleContent>
          <Separator />
          <div className="flex flex-col gap-5 p-4">
            <Alert>
              <Info />
              <AlertTitle>Revision Exception</AlertTitle>
              <AlertDescription>
                Clients with &quot;Needs Revision&quot; status can still edit and resubmit regardless of this setting.
              </AlertDescription>
            </Alert>

            <FieldGroup>
              {/* Toggle */}
              <Field>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel className="mb-0">Accept Applications</FieldLabel>
                    <FieldDescription>
                      When enabled, clients can submit new SPES applications.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={isOpen}
                    onCheckedChange={setIsOpen}
                    disabled={saving}
                  />
                </div>
              </Field>

              {/* Auto-close date */}
              <Field>
                <FieldLabel htmlFor="closeDate">
                  Auto-Close Date (Optional)
                </FieldLabel>
                <FieldDescription>
                  Set a date to automatically close applications. Leave empty for manual control only.
                </FieldDescription>
                <Input
                  id="closeDate"
                  type="datetime-local"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  disabled={saving}
                />
                {closeDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCloseDate("")}
                    disabled={saving}
                  >
                    Clear date
                  </Button>
                )}
              </Field>
            </FieldGroup>

            {/* Last updated */}
            {period?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(period.updatedAt).toLocaleString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
                {saving && <Spinner data-icon="inline-start" />}
                Update Application Period
              </Button>
              {hasUnsavedChanges && (
                <Badge variant="outline">Unsaved changes</Badge>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
