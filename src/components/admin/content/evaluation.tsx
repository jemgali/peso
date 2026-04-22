"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ClipboardListIcon } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import type {
  ApplicantPriority,
  BulkNotifyWorkflowsResponse,
  BulkUpdateWorkflowStatusResponse,
  ExamSettingsResponse,
  MutableSpesSelectionStatus,
  SpesApplicantCategory,
  SpesSelectionStatus,
  SpesWorkflowListItem,
  SpesWorkflowListResponse,
  SpesWorkflowStage,
  UpdateWorkflowResponse,
} from "@/lib/validations/spes-workflow"
import {
  formatDateTimeInputInManila,
  parseManilaDateInput,
  parseManilaDateTimeInput,
} from "@/lib/manila-datetime"

type WorkflowDraft = {
  priority: ApplicantPriority | ""
  examScore: string
}

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

const BULK_MUTABLE_STATUS_OPTIONS: Array<{
  value: MutableSpesSelectionStatus
  label: string
}> = [
  { value: "pending", label: "Pending" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "grantee", label: "Grantee" },
]

const APPLICANT_CATEGORY_LABELS: Record<SpesApplicantCategory, string> = {
  new: "New",
  spes_baby: "SPES Baby",
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

function getPrioritySelectClass(priority: ApplicantPriority | ""): string {
  if (priority === "high") {
    return "border-red-500 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
  }
  if (priority === "moderate") {
    return "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
  }
  if (priority === "low") {
    return "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
  }
  return ""
}

function toDraft(workflow: SpesWorkflowListItem): WorkflowDraft {
  return {
    priority: workflow.priority || "",
    examScore: workflow.examScore === null ? "" : String(workflow.examScore),
  }
}

function getStageBadgeVariant(stage: SpesWorkflowStage): "default" | "secondary" | "destructive" | "outline" {
  if (stage === "waitlisted") return "destructive"
  if (stage === "grantee_selected" || stage === "office_assigned") return "default"
  if (stage === "interview_scheduled" || stage === "exam_scheduled" || stage === "orientation_scheduled") {
    return "secondary"
  }
  return "outline"
}

export default function Evaluation() {
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingWorkflowId, setSavingWorkflowId] = useState<string | null>(null)
  const [notifyingApplicants, setNotifyingApplicants] = useState(false)
  const [updatingBulkStatus, setUpdatingBulkStatus] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const [totalScore, setTotalScore] = useState<number>(100)
  const [thresholdPercent, setThresholdPercent] = useState<number>(75)
  const [workflows, setWorkflows] = useState<SpesWorkflowListItem[]>([])
  const [drafts, setDrafts] = useState<Record<string, WorkflowDraft>>({})
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set())
  const [notificationNote, setNotificationNote] = useState("")
  const [attachSchedule, setAttachSchedule] = useState(false)
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleDescription, setScheduleDescription] = useState("")
  const [scheduleAllDay, setScheduleAllDay] = useState(false)
  const [scheduleStartDate, setScheduleStartDate] = useState(
    formatDateTimeInputInManila(new Date())
  )
  const [scheduleEndDate, setScheduleEndDate] = useState("")
  const [search, setSearch] = useState("")
  const [bulkStatus, setBulkStatus] = useState<MutableSpesSelectionStatus>("pending")
  const [bulkNote, setBulkNote] = useState("")

  const loadSettings = useCallback(async () => {
    setLoadingSettings(true)
    setSettingsError(null)

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.EVALUATION_SETTINGS, {
        cache: "no-store",
      })
      const payload = (await response.json()) as ExamSettingsResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load exam settings")
      }

      setTotalScore(payload.data.totalScore)
      setThresholdPercent(payload.data.passingThresholdPercent)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load exam settings"
      setSettingsError(message)
      toast.error(message)
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true)
    setWorkflowError(null)

    try {
      const params = new URLSearchParams()
      const trimmedSearch = search.trim()
      if (trimmedSearch) {
        params.set("search", trimmedSearch)
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

      const workflowsData = payload.data.workflows
      setWorkflows(workflowsData)
      setDrafts(
        workflowsData.reduce<Record<string, WorkflowDraft>>((acc, workflow) => {
          acc[workflow.workflowId] = toDraft(workflow)
          return acc
        }, {})
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workflow queue"
      setWorkflowError(message)
      toast.error(message)
    } finally {
      setLoadingWorkflows(false)
    }
  }, [search])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkflows()
    }, 250)

    return () => clearTimeout(timer)
  }, [loadWorkflows])

  const saveSettings = async () => {
    setSavingSettings(true)

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.EVALUATION_SETTINGS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalScore,
          passingThresholdPercent: thresholdPercent,
        }),
      })
      const payload = (await response.json()) as ExamSettingsResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to save exam settings")
      }

      setTotalScore(payload.data.totalScore)
      setThresholdPercent(payload.data.passingThresholdPercent)
      toast.success("Examination settings saved")
      await loadWorkflows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save exam settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const updateDraft = (
    workflowId: string,
    updater: (current: WorkflowDraft) => WorkflowDraft
  ) => {
    setDrafts((current) => {
      const existing = current[workflowId]
      if (!existing) return current

      return {
        ...current,
        [workflowId]: updater(existing),
      }
    })
  }

  const saveWorkflow = async (workflowId: string) => {
    const draft = drafts[workflowId]
    if (!draft) return

    setSavingWorkflowId(workflowId)
    try {
      const response = await fetch(`${ROUTES.API.ADMIN.SPES.WORKFLOWS}/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: draft.priority || null,
          examScore: draft.examScore === "" ? null : Number(draft.examScore),
        }),
      })

      const payload = (await response.json()) as UpdateWorkflowResponse
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save workflow row")
      }

      toast.success("Evaluation row updated")
      await loadWorkflows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save workflow row")
    } finally {
      setSavingWorkflowId(null)
    }
  }

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
    if (attachSchedule) {
      const trimmedScheduleTitle = scheduleTitle.trim()
      if (!trimmedScheduleTitle) {
        toast.error("Schedule title is required when calendar scheduling is enabled")
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
      setAttachSchedule(false)
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

  const applyBulkStatus = async () => {
    const targetWorkflowIds = Array.from(selectedWorkflowIds)
    if (targetWorkflowIds.length === 0) {
      toast.error("Select at least one applicant from the table")
      return
    }

    setUpdatingBulkStatus(true)
    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.WORKFLOWS_BULK_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowIds: targetWorkflowIds,
          selectionStatus: bulkStatus,
          note: bulkNote.trim() || undefined,
        }),
      })
      const payload = (await response.json()) as BulkUpdateWorkflowStatusResponse
      const result = payload.data

      if (!response.ok || !payload.success || !result) {
        throw new Error(payload.error || "Failed to apply bulk status")
      }

      toast.success(
        `Updated ${result.updated} record${result.updated === 1 ? "" : "s"} to ${toSelectionStatusLabel(
          bulkStatus
        ).toLowerCase()}.`
      )
      if (result.autoDenied > 0) {
        toast.info(
          `${result.autoDenied} record${result.autoDenied === 1 ? " was" : "s were"} kept as denied due to failed exam results.`
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
      setBulkNote("")
      await loadWorkflows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply bulk status")
    } finally {
      setUpdatingBulkStatus(false)
    }
  }

  const passingScore = useMemo(() => {
    if (!Number.isFinite(totalScore) || !Number.isFinite(thresholdPercent)) return 0
    return Math.ceil((totalScore * thresholdPercent) / 100)
  }, [totalScore, thresholdPercent])

  const allSelected =
    workflows.length > 0 && workflows.every((workflow) => selectedWorkflowIds.has(workflow.workflowId))
  const selectedCount = selectedWorkflowIds.size

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluation</h1>
        <p className="text-muted-foreground">
          Priority listing, examination scoring, ranking, and applicant status updates for SPES.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="Search applicant name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="md:max-w-sm"
              />
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:ml-auto">
                Selected applicants: <span className="font-medium text-foreground">{selectedCount}</span>
              </div>
            </div>

            {loadingWorkflows ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner data-icon="inline-start" />
                Loading records...
              </div>
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
                    Try adjusting your search/filter criteria or wait for approved SPES applications.
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
                    <TableHead>Category</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => {
                    const draft = drafts[workflow.workflowId]
                    if (!draft) return null
                    const isSpesBaby = workflow.applicantCategory === "spes_baby"

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
                          <Badge variant={isSpesBaby ? "secondary" : "outline"}>
                            {APPLICANT_CATEGORY_LABELS[workflow.applicantCategory]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStageBadgeVariant(workflow.stage)}>
                            {WORKFLOW_STAGE_LABELS[workflow.stage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isSpesBaby ? (
                            <Badge variant="outline">N/A</Badge>
                          ) : (
                            <NativeSelect
                              value={draft.priority}
                              className={getPrioritySelectClass(draft.priority)}
                              onChange={(event) =>
                                updateDraft(workflow.workflowId, (current) => ({
                                  ...current,
                                  priority: event.target.value as ApplicantPriority | "",
                                }))
                              }
                            >
                              <NativeSelectOption value="">Not set</NativeSelectOption>
                              <NativeSelectOption value="high">High</NativeSelectOption>
                              <NativeSelectOption value="moderate">Moderate</NativeSelectOption>
                              <NativeSelectOption value="low">Low</NativeSelectOption>
                            </NativeSelect>
                          )}
                        </TableCell>
                        <TableCell>
                          {isSpesBaby ? (
                            <Badge variant="outline">N/A</Badge>
                          ) : (
                            <Input
                              type="number"
                              min={0}
                              className="h-9 w-24"
                              value={draft.examScore}
                              onChange={(event) =>
                                updateDraft(workflow.workflowId, (current) => ({
                                  ...current,
                                  examScore: event.target.value,
                                }))
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {isSpesBaby ? (
                            <Badge variant="outline">N/A</Badge>
                          ) : (
                            <Badge
                              variant={
                                workflow.examResult === "passed"
                                  ? "secondary"
                                  : workflow.examResult === "failed"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {workflow.examResult.toUpperCase()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {isSpesBaby ? "N/A" : workflow.rankPosition ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSelectionStatusBadgeVariant(workflow.selectionStatus)}>
                            {toSelectionStatusLabel(workflow.selectionStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isSpesBaby ? (
                            <span className="text-xs text-muted-foreground">
                              Basic fields only
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void saveWorkflow(workflow.workflowId)}
                              disabled={savingWorkflowId === workflow.workflowId}
                            >
                              {savingWorkflowId === workflow.workflowId && (
                                <Spinner data-icon="inline-start" />
                              )}
                              Save Row
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="notify" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notify">Notify</TabsTrigger>
            <TabsTrigger value="exam-settings">Exam Settings</TabsTrigger>
            <TabsTrigger value="bulk-control">Bulk Control</TabsTrigger>
          </TabsList>

          <TabsContent value="notify" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notify Selected Applicants</CardTitle>
                <CardDescription>
                  Send the same update to all selected applicants without changing workflow status.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  Message template: <span className="font-medium text-foreground">SPES Evaluation Update</span>. This
                  sends in-app and email notifications to selected applicants.
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="notificationNote">Admin Note (optional)</Label>
                  <Textarea
                    id="notificationNote"
                    value={notificationNote}
                    onChange={(event) => setNotificationNote(event.target.value)}
                    placeholder="Optional note added to the notification message"
                  />
                </div>

                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="attachSchedule"
                      checked={attachSchedule}
                      onCheckedChange={(checked) => setAttachSchedule(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="attachSchedule" className="cursor-pointer">
                        Add calendar event for selected applicants
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Calendar-only schedule. This does not change applicant workflow stage.
                      </p>
                    </div>
                  </div>

                  {attachSchedule && (
                    <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="notifyScheduleTitle">Schedule Title</Label>
                        <Input
                          id="notifyScheduleTitle"
                          value={scheduleTitle}
                          onChange={(event) => setScheduleTitle(event.target.value)}
                          placeholder="e.g. SPES Requirements Follow-up"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="notifyScheduleDescription">Schedule Description (optional)</Label>
                        <Textarea
                          id="notifyScheduleDescription"
                          value={scheduleDescription}
                          onChange={(event) => setScheduleDescription(event.target.value)}
                          placeholder="Optional details about this scheduled event"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="notifyScheduleAllDay"
                          checked={scheduleAllDay}
                          onCheckedChange={(checked) => setScheduleAllDay(checked === true)}
                        />
                        <Label htmlFor="notifyScheduleAllDay" className="cursor-pointer">
                          All-day event
                        </Label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="notifyScheduleStart">
                            {scheduleAllDay ? "Start Date" : "Start Date & Time"}
                          </Label>
                          <Input
                            id="notifyScheduleStart"
                            type={scheduleAllDay ? "date" : "datetime-local"}
                            value={scheduleAllDay ? scheduleStartDate.split("T")[0] || "" : scheduleStartDate}
                            onChange={(event) => setScheduleStartDate(event.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="notifyScheduleEnd">
                            {scheduleAllDay ? "End Date (optional)" : "End Date & Time (optional)"}
                          </Label>
                          <Input
                            id="notifyScheduleEnd"
                            type={scheduleAllDay ? "date" : "datetime-local"}
                            value={scheduleAllDay ? scheduleEndDate.split("T")[0] || "" : scheduleEndDate}
                            onChange={(event) => setScheduleEndDate(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  Selected applicants: <span className="font-medium text-foreground">{selectedCount}</span>
                </div>

                <Button
                  type="button"
                  onClick={notifySelectedApplicants}
                  disabled={notifyingApplicants || selectedCount === 0}
                >
                  {notifyingApplicants && <Spinner data-icon="inline-start" />}
                  Notify Selected Applicants
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exam-settings" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Examination Settings</CardTitle>
                <CardDescription>
                  Configure score scale and passing threshold used for automatic pass/fail and denied status.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {loadingSettings ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner data-icon="inline-start" />
                    Loading settings...
                  </div>
                ) : settingsError ? (
                  <p className="text-sm text-destructive">{settingsError}</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="totalScore">Total Score</Label>
                      <Input
                        id="totalScore"
                        type="number"
                        min={1}
                        value={totalScore}
                        onChange={(e) => setTotalScore(Number(e.target.value || 0))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="thresholdPercent">Passing Threshold (%)</Label>
                      <Input
                        id="thresholdPercent"
                        type="number"
                        min={1}
                        max={100}
                        value={thresholdPercent}
                        onChange={(e) => setThresholdPercent(Number(e.target.value || 0))}
                      />
                    </div>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Auto-calculated passing score</p>
                        <p className="text-xl font-semibold">
                          {passingScore} / {totalScore} ({thresholdPercent}%)
                        </p>
                      </CardContent>
                    </Card>
                    <Button type="button" onClick={saveSettings} disabled={savingSettings}>
                      {savingSettings && <Spinner data-icon="inline-start" />}
                      Save Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-control" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Control</CardTitle>
                <CardDescription>
                  Apply one status to selected applicants. Denied is auto-derived for failed examinees.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bulkStatus">Target Status</Label>
                  <NativeSelect
                    id="bulkStatus"
                    value={bulkStatus}
                    onChange={(event) =>
                      setBulkStatus(event.target.value as MutableSpesSelectionStatus)
                    }
                  >
                    {BULK_MUTABLE_STATUS_OPTIONS.map((status) => (
                      <NativeSelectOption key={status.value} value={status.value}>
                        {status.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="bulkNote">Bulk Note (optional)</Label>
                  <Textarea
                    id="bulkNote"
                    value={bulkNote}
                    onChange={(event) => setBulkNote(event.target.value)}
                    placeholder="Optional note stored in stage history when status stage changes"
                  />
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  Selected applicants: <span className="font-medium text-foreground">{selectedCount}</span>
                </div>

                <Button
                  type="button"
                  onClick={applyBulkStatus}
                  disabled={updatingBulkStatus || selectedCount === 0}
                >
                  {updatingBulkStatus && <Spinner data-icon="inline-start" />}
                  Apply Bulk Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
