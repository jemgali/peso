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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ROUTES } from "@/lib/constants/routes"
import type {
  ApplicantPriority,
  ExamSettingsResponse,
  SpesWorkflowListItem,
  SpesWorkflowListResponse,
  SpesWorkflowStage,
  UpdateWorkflowResponse,
  WorkflowScheduleResponse,
  WorkflowScheduleStageType,
} from "@/lib/validations/spes-workflow"

type WorkflowDraft = {
  priority: ApplicantPriority | ""
  examScore: string
  rankPosition: string
  isWaitlisted: boolean
  isGrantee: boolean
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

const SCHEDULE_STAGE_OPTIONS: Array<{ value: WorkflowScheduleStageType; label: string }> = [
  { value: "interview", label: "Interview" },
  { value: "exam", label: "Exam" },
  { value: "orientation", label: "Orientation" },
]

function toDraft(workflow: SpesWorkflowListItem): WorkflowDraft {
  return {
    priority: workflow.priority || "",
    examScore: workflow.examScore === null ? "" : String(workflow.examScore),
    rankPosition: workflow.rankPosition === null ? "" : String(workflow.rankPosition),
    isWaitlisted: workflow.isWaitlisted,
    isGrantee: workflow.isGrantee,
  }
}

function toDateTimeInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function toDateInputValue(date: Date): string {
  return toDateTimeInputValue(date).slice(0, 10)
}

function parseScheduleDate(value: string, allDay: boolean, asEndDate: boolean): Date {
  if (allDay) {
    return new Date(`${value}${asEndDate ? "T23:59:00" : "T00:00:00"}`)
  }

  return new Date(value)
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingWorkflowId, setSavingWorkflowId] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const [totalScore, setTotalScore] = useState<number>(100)
  const [thresholdPercent, setThresholdPercent] = useState<number>(75)
  const [workflows, setWorkflows] = useState<SpesWorkflowListItem[]>([])
  const [drafts, setDrafts] = useState<Record<string, WorkflowDraft>>({})

  const [scheduleWorkflowId, setScheduleWorkflowId] = useState<string | null>(null)
  const [scheduleStageType, setScheduleStageType] = useState<WorkflowScheduleStageType>("interview")
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleDescription, setScheduleDescription] = useState("")
  const [scheduleStartDate, setScheduleStartDate] = useState("")
  const [scheduleEndDate, setScheduleEndDate] = useState("")
  const [scheduleAllDay, setScheduleAllDay] = useState(false)
  const [schedulingWorkflowId, setSchedulingWorkflowId] = useState<string | null>(null)

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
      const response = await fetch(ROUTES.API.ADMIN.SPES.WORKFLOWS, {
        cache: "no-store",
      })
      const payload = (await response.json()) as SpesWorkflowListResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load workflow queue")
      }

      setWorkflows(payload.data.workflows)
      setDrafts(
        payload.data.workflows.reduce<Record<string, WorkflowDraft>>((acc, workflow) => {
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
  }, [])

  useEffect(() => {
    void loadSettings()
    void loadWorkflows()
  }, [loadSettings, loadWorkflows])

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
      setSettingsOpen(false)
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
          rankPosition: draft.rankPosition === "" ? null : Number(draft.rankPosition),
          isWaitlisted: draft.isWaitlisted,
          isGrantee: draft.isGrantee,
        }),
      })

      const payload = (await response.json()) as UpdateWorkflowResponse
      const updatedWorkflow = payload.data?.workflow

      if (!response.ok || !payload.success || !updatedWorkflow) {
        throw new Error(payload.error || "Failed to save workflow row")
      }

      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.workflowId === workflowId ? updatedWorkflow : workflow
        )
      )
      setDrafts((current) => ({
        ...current,
        [workflowId]: toDraft(updatedWorkflow),
      }))
      toast.success("Evaluation row updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save workflow row")
    } finally {
      setSavingWorkflowId(null)
    }
  }

  const openScheduleDialog = (workflow: SpesWorkflowListItem) => {
    const defaultStartDate = new Date(Date.now() + 60 * 60 * 1000)

    setScheduleWorkflowId(workflow.workflowId)
    setScheduleStageType("interview")
    setScheduleTitle("")
    setScheduleDescription("")
    setScheduleAllDay(false)
    setScheduleStartDate(toDateTimeInputValue(defaultStartDate))
    setScheduleEndDate("")
  }

  const closeScheduleDialog = () => {
    if (schedulingWorkflowId) return

    setScheduleWorkflowId(null)
    setScheduleStageType("interview")
    setScheduleTitle("")
    setScheduleDescription("")
    setScheduleAllDay(false)
    setScheduleStartDate("")
    setScheduleEndDate("")
  }

  const updateScheduleAllDay = (checked: boolean) => {
    setScheduleAllDay(checked)

    setScheduleStartDate((current) => {
      if (!current) return checked ? toDateInputValue(new Date()) : toDateTimeInputValue(new Date())
      const parsedDate = new Date(current)
      if (Number.isNaN(parsedDate.getTime())) return current
      return checked ? toDateInputValue(parsedDate) : toDateTimeInputValue(parsedDate)
    })

    setScheduleEndDate((current) => {
      if (!current) return ""
      const parsedDate = new Date(current)
      if (Number.isNaN(parsedDate.getTime())) return current
      return checked ? toDateInputValue(parsedDate) : toDateTimeInputValue(parsedDate)
    })
  }

  const saveSchedule = async () => {
    if (!scheduleWorkflowId) return
    if (!scheduleStartDate) {
      toast.error("Start date is required")
      return
    }

    const startDate = parseScheduleDate(scheduleStartDate, scheduleAllDay, false)
    const endDate = scheduleEndDate
      ? parseScheduleDate(scheduleEndDate, scheduleAllDay, true)
      : null

    if (Number.isNaN(startDate.getTime())) {
      toast.error("Invalid start date")
      return
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      toast.error("Invalid end date")
      return
    }

    if (endDate && endDate.getTime() < startDate.getTime()) {
      toast.error("End date must be after start date")
      return
    }

    setSchedulingWorkflowId(scheduleWorkflowId)

    try {
      const response = await fetch(
        `${ROUTES.API.ADMIN.SPES.WORKFLOWS}/${scheduleWorkflowId}/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stageType: scheduleStageType,
            title: scheduleTitle.trim() || undefined,
            description: scheduleDescription.trim() || null,
            startDate: startDate.toISOString(),
            endDate: endDate?.toISOString() || null,
            allDay: scheduleAllDay,
          }),
        }
      )

      const payload = (await response.json()) as WorkflowScheduleResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to save schedule")
      }

      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.workflowId === scheduleWorkflowId
            ? {
                ...workflow,
                stage: payload.data?.stage || workflow.stage,
              }
            : workflow
        )
      )

      toast.success(
        `${SCHEDULE_STAGE_OPTIONS.find((option) => option.value === scheduleStageType)?.label} schedule ${
          payload.data.wasUpdated ? "updated" : "saved"
        }`
      )

      closeScheduleDialog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save schedule")
    } finally {
      setSchedulingWorkflowId(null)
    }
  }

  const passingScore = useMemo(() => {
    if (!Number.isFinite(totalScore) || !Number.isFinite(thresholdPercent)) return 0
    return Math.ceil((totalScore * thresholdPercent) / 100)
  }, [totalScore, thresholdPercent])

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.workflowId === scheduleWorkflowId) || null,
    [workflows, scheduleWorkflowId]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluation</h1>
        <p className="text-muted-foreground">
          Priority listing, examination scoring, and qualification workflow for SPES.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Examination Settings</CardTitle>
            <CardDescription>
              Configure score scale and passing threshold used for automatic pass/fail.
            </CardDescription>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button>Configure Exam Rules</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Examination Rule Setup</DialogTitle>
                <DialogDescription>
                  Set total possible score and passing threshold percentage.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalScore">Total Score</Label>
                  <Input
                    id="totalScore"
                    type="number"
                    min={1}
                    value={totalScore}
                    onChange={(e) => setTotalScore(Number(e.target.value || 0))}
                  />
                </div>
                <div className="grid gap-2">
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
                    <p className="text-2xl font-semibold">
                      {passingScore} / {totalScore}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings && <Spinner data-icon="inline-start" />}
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingSettings ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" />
              Loading settings...
            </div>
          ) : settingsError ? (
            <p className="text-sm text-destructive">{settingsError}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Passing score is auto-calculated from total score and threshold.
              </p>
              <p className="text-xl font-semibold">
                Current: {passingScore} / {totalScore} ({thresholdPercent}%)
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Queue</CardTitle>
          <CardDescription>
            Approved SPES submissions are listed here. Update priority, score, rank, waitlist, grantee, and scheduling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingWorkflows ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" />
              Loading evaluation queue...
            </div>
          ) : workflowError ? (
            <p className="text-sm text-destructive">{workflowError}</p>
          ) : workflows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved SPES applications yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Waitlist</TableHead>
                  <TableHead>Grantee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => {
                  const draft = drafts[workflow.workflowId]
                  if (!draft) return null

                  return (
                    <TableRow key={workflow.workflowId}>
                      <TableCell>
                        <div className="font-medium">{workflow.applicantName}</div>
                        <p className="text-xs text-muted-foreground">
                          Submission #{workflow.submissionNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStageBadgeVariant(workflow.stage)}>
                          {WORKFLOW_STAGE_LABELS[workflow.stage]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                          value={draft.priority}
                          onChange={(event) =>
                            updateDraft(workflow.workflowId, (current) => ({
                              ...current,
                              priority: event.target.value as ApplicantPriority | "",
                            }))
                          }
                        >
                          <option value="">Not set</option>
                          <option value="high">High</option>
                          <option value="moderate">Moderate</option>
                          <option value="low">Low</option>
                        </select>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          className="h-9 w-20"
                          value={draft.rankPosition}
                          onChange={(event) =>
                            updateDraft(workflow.workflowId, (current) => ({
                              ...current,
                              rankPosition: event.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant={draft.isWaitlisted ? "destructive" : "outline"}>
                            {draft.isWaitlisted ? "Waitlisted" : "Not waitlisted"}
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant={draft.isWaitlisted ? "default" : "outline"}
                            onClick={() =>
                              updateDraft(workflow.workflowId, (current) => ({
                                ...current,
                                isWaitlisted: !current.isWaitlisted,
                              }))
                            }
                          >
                            Toggle
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant={draft.isGrantee ? "default" : "outline"}>
                            {draft.isGrantee ? "Selected" : "Not selected"}
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant={draft.isGrantee ? "default" : "outline"}
                            onClick={() =>
                              updateDraft(workflow.workflowId, (current) => ({
                                ...current,
                                isGrantee: !current.isGrantee,
                              }))
                            }
                          >
                            Toggle
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
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
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openScheduleDialog(workflow)}
                          >
                            Schedule
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(scheduleWorkflowId)}
        onOpenChange={(openState) => {
          if (!openState) {
            closeScheduleDialog()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Workflow Stage</DialogTitle>
            <DialogDescription>
              {selectedWorkflow
                ? `Set interview, exam, or orientation schedule for ${selectedWorkflow.applicantName}.`
                : "Set interview, exam, or orientation schedule."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="scheduleStageType">Stage Type</Label>
              <select
                id="scheduleStageType"
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={scheduleStageType}
                onChange={(event) =>
                  setScheduleStageType(event.target.value as WorkflowScheduleStageType)
                }
              >
                {SCHEDULE_STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduleTitle">Title (optional)</Label>
              <Input
                id="scheduleTitle"
                value={scheduleTitle}
                onChange={(event) => setScheduleTitle(event.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduleDescription">Description (optional)</Label>
              <Textarea
                id="scheduleDescription"
                value={scheduleDescription}
                onChange={(event) => setScheduleDescription(event.target.value)}
                placeholder="Include venue, reminders, or instructions"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="scheduleAllDay"
                checked={scheduleAllDay}
                onCheckedChange={(checked) => updateScheduleAllDay(checked === true)}
              />
              <Label htmlFor="scheduleAllDay">All day event</Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="scheduleStartDate">Start</Label>
                <Input
                  id="scheduleStartDate"
                  type={scheduleAllDay ? "date" : "datetime-local"}
                  value={scheduleStartDate}
                  onChange={(event) => setScheduleStartDate(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduleEndDate">End (optional)</Label>
                <Input
                  id="scheduleEndDate"
                  type={scheduleAllDay ? "date" : "datetime-local"}
                  value={scheduleEndDate}
                  onChange={(event) => setScheduleEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeScheduleDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveSchedule}
              disabled={!scheduleWorkflowId || schedulingWorkflowId === scheduleWorkflowId}
            >
              {schedulingWorkflowId === scheduleWorkflowId && <Spinner data-icon="inline-start" />}
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
