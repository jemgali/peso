"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { EvaluationSkeleton } from "@/components/ui/skeletons"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { ClipboardListIcon, SearchIcon, InfoIcon, MegaphoneIcon } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  BulkNotifyWorkflowsResponse,
  SpesApplicantCategory,
  SpesSelectionStatus,
  SpesWorkflowListItem,
  SpesWorkflowListResponse,
  SpesWorkflowStage,
} from "@/lib/validations/spes-workflow"
import {
  formatDateTimeInputInManila,
  parseManilaDateInput,
  parseManilaDateTimeInput,
} from "@/lib/manila-datetime"

const WORKFLOW_STAGE_LABELS: Record<SpesWorkflowStage, string> = {
  application_approved: "Application Approved",
  interview_scheduled: "Interview Scheduled",
  priority_assigned: "Priority Assigned",
  exam_scheduled: "Exam Scheduled",
  exam_evaluated: "Exam Evaluated",
  qualified: "Qualified",
  waitlisted: "Waitlisted",
  grantee_selected: "Grantee Selected",
  documents_released: "Documents Released",
  orientation_scheduled: "Orientation Scheduled",
  batch_assigned: "Batch Assigned",
  office_assigned: "Office Assigned",
}

function toSelectionStatusLabel(status: SpesSelectionStatus): string {
  if (status === "waitlisted") return "Waitlisted"
  if (status === "grantee") return "Grantee"
  if (status === "denied") return "Denied"
  return "Pending"
}

function getSelectionStatusBadgeVariant(
  status: SpesSelectionStatus
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "grantee") return "default"
  if (status === "waitlisted" || status === "denied") return "destructive"
  return "outline"
}

function getStageBadgeVariant(stage: SpesWorkflowStage): "default" | "secondary" | "destructive" | "outline" {
  if (stage === "waitlisted") return "destructive"
  if (stage === "grantee_selected" || stage === "office_assigned") return "default"
  if (stage === "interview_scheduled" || stage === "exam_scheduled" || stage === "orientation_scheduled") {
    return "secondary"
  }
  return "outline"
}

export default function Notify() {
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [notifyingApplicants, setNotifyingApplicants] = useState(false)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const [workflows, setWorkflows] = useState<SpesWorkflowListItem[]>([])
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set())
  const [notificationNote, setNotificationNote] = useState("")
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleDescription, setScheduleDescription] = useState("")
  const [scheduleAllDay, setScheduleAllDay] = useState(false)
  const [scheduleStartDate, setScheduleStartDate] = useState(
    formatDateTimeInputInManila(new Date())
  )
  const [scheduleEndDate, setScheduleEndDate] = useState("")
  const [search, setSearch] = useState("")
  const [applicantCategory, setApplicantCategory] = useState<SpesApplicantCategory>("new")
  const [statusFilter, setStatusFilter] = useState<SpesSelectionStatus | "all">("all")

  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true)
    setWorkflowError(null)

    try {
      const params = new URLSearchParams()
      const trimmedSearch = search.trim()
      if (trimmedSearch) {
        params.set("search", trimmedSearch)
      }
      if (applicantCategory) {
        params.set("category", applicantCategory)
      }
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      const endpoint = params.toString()
        ? `${ROUTES.API.ADMIN.SPES.WORKFLOWS}?${params.toString()}`
        : ROUTES.API.ADMIN.SPES.WORKFLOWS

      const response = await fetch(endpoint, {
        cache: "no-store",
      })
      const payload = (await response.json()) as SpesWorkflowListResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load workflow queue")
      }

      setWorkflows(payload.data.workflows)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workflow queue"
      setWorkflowError(message)
      toast.error(message)
    } finally {
      setLoadingWorkflows(false)
    }
  }, [search, applicantCategory, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkflows()
    }, 250)

    return () => clearTimeout(timer)
  }, [loadWorkflows])

  const toggleWorkflowSelection = (workflowId: string, checked: boolean) => {
    setSelectedWorkflowIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(workflowId)
      } else {
        next.delete(workflowId)
      }
      return next
    })
  }

  const toggleAllWorkflowSelections = (checked: boolean) => {
    setSelectedWorkflowIds((current) => {
      const next = new Set(current)
      for (const workflow of workflows) {
        if (checked) {
          next.add(workflow.workflowId)
        } else {
          next.delete(workflow.workflowId)
        }
      }
      return next
    })
  }

  const notifySelectedApplicants = async () => {
    const targetWorkflowIds = Array.from(selectedWorkflowIds)
    if (targetWorkflowIds.length === 0) {
      toast.error("Select at least one applicant from the table")
      return
    }

    let schedulePayload:
      | {
          title: string
          description?: string
          startDate: string
          endDate?: string | null
          allDay: boolean
        }
      | undefined

    const trimmedScheduleTitle = scheduleTitle.trim()
    if (!trimmedScheduleTitle) {
      toast.error("Schedule title is required")
      return
    }

    if (!scheduleStartDate) {
      toast.error("Schedule start date is required")
      return
    }

    const startDateInputValue = scheduleAllDay
      ? scheduleStartDate.split("T")[0] || scheduleStartDate
      : scheduleStartDate
    const parsedStartDate = scheduleAllDay
      ? parseManilaDateInput(startDateInputValue)
      : parseManilaDateTimeInput(scheduleStartDate)
    if (!parsedStartDate) {
      toast.error("Schedule start date is invalid")
      return
    }

    let parsedEndDate: Date | null = null
    if (scheduleEndDate) {
      const endDateInputValue = scheduleAllDay
        ? scheduleEndDate.split("T")[0] || scheduleEndDate
        : scheduleEndDate
      parsedEndDate = scheduleAllDay
        ? parseManilaDateInput(endDateInputValue)
        : parseManilaDateTimeInput(scheduleEndDate)
      if (!parsedEndDate) {
        toast.error("Schedule end date is invalid")
        return
      }

      if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
        toast.error("Schedule end date must be after or equal to start date")
        return
      }
    }

    schedulePayload = {
      title: trimmedScheduleTitle,
      description: scheduleDescription.trim() || undefined,
      startDate: parsedStartDate.toISOString(),
      endDate: parsedEndDate ? parsedEndDate.toISOString() : null,
      allDay: scheduleAllDay,
    }

    setNotifyingApplicants(true)
    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.WORKFLOWS_NOTIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowIds: targetWorkflowIds,
          note: notificationNote.trim() || undefined,
          schedule: schedulePayload,
        }),
      })
      const payload = (await response.json()) as BulkNotifyWorkflowsResponse
      const result = payload.data

      if (!response.ok || !payload.success || !result) {
        throw new Error(payload.error || "Failed to notify selected applicants")
      }

      toast.success(
        `Notified ${result.notified} applicant${result.notified === 1 ? "" : "s"} (${result.emailSent} email${
          result.emailSent === 1 ? "" : "s"
        } sent).`
      )
      if (result.scheduledEvent) {
        toast.success(
          `Scheduled "${result.scheduledEvent.title}" for ${result.scheduledEvent.recipientCount} selected applicant${
            result.scheduledEvent.recipientCount === 1 ? "" : "s"
          }.`
        )
      }
      if (result.missingWorkflowIds.length > 0) {
        toast.info(
          `${result.missingWorkflowIds.length} selected record${
            result.missingWorkflowIds.length === 1 ? " was" : "s were"
          } skipped because they were unavailable.`
        )
      }

      setSelectedWorkflowIds(new Set())
      setNotificationNote("")
      setScheduleTitle("")
      setScheduleDescription("")
      setScheduleAllDay(false)
      setScheduleStartDate(formatDateTimeInputInManila(new Date()))
      setScheduleEndDate("")
      await loadWorkflows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to notify selected applicants")
    } finally {
      setNotifyingApplicants(false)
    }
  }

  const allSelected =
    workflows.length > 0 && workflows.every((workflow) => selectedWorkflowIds.has(workflow.workflowId))
  const selectedCount = selectedWorkflowIds.size

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Notify</h1>
        <p className="text-muted-foreground">
          Send outgoing notifications and schedule events for SPES Grantees.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1 md:max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applicant name..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>

                <ToggleGroup
                  type="single"
                  value={applicantCategory}
                  onValueChange={(value) => {
                    if (value) setApplicantCategory(value as SpesApplicantCategory)
                  }}
                  variant="outline"
                  className="justify-start"
                >
                  <ToggleGroupItem value="new" className="px-4">
                    New Applicant
                  </ToggleGroupItem>
                  <ToggleGroupItem value="spes_baby" className="px-4">
                    SPES Baby
                  </ToggleGroupItem>
                </ToggleGroup>

                <div className="flex items-center gap-2 md:ml-auto">
                  <Label htmlFor="statusFilter" className="sr-only">
                    Status Filter
                  </Label>
                  <NativeSelect
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as SpesSelectionStatus | "all")}
                    className="w-[140px]"
                  >
                    <NativeSelectOption value="all">All Statuses</NativeSelectOption>
                    <NativeSelectOption value="pending">Pending</NativeSelectOption>
                    <NativeSelectOption value="waitlisted">Waitlisted</NativeSelectOption>
                    <NativeSelectOption value="grantee">Grantee</NativeSelectOption>
                    <NativeSelectOption value="denied">Denied</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1">
                  Selected: <span className="font-medium text-foreground">{selectedCount}</span>
                </div>
              </div>
            </div>

            {loadingWorkflows ? (
              <EvaluationSkeleton />
            ) : workflowError ? (
              <p className="text-sm text-destructive">{workflowError}</p>
            ) : workflows.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardListIcon />
                  </EmptyMedia>
                  <EmptyTitle>No records found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search/filter criteria.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleAllWorkflowSelections(checked === true)}
                      />
                    </TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => {
                    return (
                      <TableRow key={workflow.workflowId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedWorkflowIds.has(workflow.workflowId)}
                            onCheckedChange={(checked) =>
                              toggleWorkflowSelection(workflow.workflowId, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{workflow.applicantName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStageBadgeVariant(workflow.stage)}>
                            {WORKFLOW_STAGE_LABELS[workflow.stage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSelectionStatusBadgeVariant(workflow.selectionStatus)}>
                            {toSelectionStatusLabel(workflow.selectionStatus)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notify Selected Applicants</CardTitle>
            <CardDescription>
              Send a calendar event notification to all selected applicants.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="notificationNote">Notification Note (optional)</Label>
                <Textarea
                  id="notificationNote"
                  value={notificationNote}
                  onChange={(event) => setNotificationNote(event.target.value)}
                  placeholder="Additional context included in the notification email..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notifyScheduleTitle">Schedule Title</Label>
                <NativeSelect
                  id="notifyScheduleTitle"
                  value={scheduleTitle}
                  onChange={(event) => setScheduleTitle(event.target.value)}
                >
                  <NativeSelectOption value="">Select Title</NativeSelectOption>
                  <NativeSelectOption value="Interview">Interview</NativeSelectOption>
                  <NativeSelectOption value="Examination">Examination</NativeSelectOption>
                  <NativeSelectOption value="Orientation">Orientation</NativeSelectOption>
                  <NativeSelectOption value="Submission">Submission</NativeSelectOption>
                  <NativeSelectOption value="Others">Others</NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notifyScheduleDescription">Schedule Description (optional)</Label>
                <Textarea
                  id="notifyScheduleDescription"
                  value={scheduleDescription}
                  onChange={(event) => setScheduleDescription(event.target.value)}
                  placeholder="Optional details about the event"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notifyScheduleStartDate">Start Date & Time</Label>
                  <Input
                    id="notifyScheduleStartDate"
                    type={scheduleAllDay ? "date" : "datetime-local"}
                    value={scheduleStartDate}
                    onChange={(event) => setScheduleStartDate(event.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="notifyScheduleEndDate">End Date & Time (optional)</Label>
                  <Input
                    id="notifyScheduleEndDate"
                    type={scheduleAllDay ? "date" : "datetime-local"}
                    value={scheduleEndDate}
                    onChange={(event) => setScheduleEndDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="notifyScheduleAllDay"
                  checked={scheduleAllDay}
                  onCheckedChange={(checked) => setScheduleAllDay(checked === true)}
                />
                <Label htmlFor="notifyScheduleAllDay" className="cursor-pointer">
                  All day event
                </Label>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => void notifySelectedApplicants()}
              disabled={notifyingApplicants || selectedCount === 0}
            >
              {notifyingApplicants ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <MegaphoneIcon data-icon="inline-start" />
              )}
              Send Event Notification ({selectedCount})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
