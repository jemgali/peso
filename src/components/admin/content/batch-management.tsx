"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { ROUTES } from "@/lib/constants/routes"
import type {
  BatchListItem,
  BatchListResponse,
  CreateBatchResponse,
  SpesWorkflowListItem,
  SpesWorkflowListResponse,
  SpesWorkflowStage,
  WorkflowAssignmentResponse,
} from "@/lib/validations/spes-workflow"

type AssignmentDraft = {
  batchId: string
  assignedOffice: string
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

function toAssignmentDraft(workflow: SpesWorkflowListItem): AssignmentDraft {
  return {
    batchId: workflow.batchId || "",
    assignedOffice: workflow.assignedOffice || "",
  }
}

function normalizeOffice(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getStageBadgeVariant(stage: SpesWorkflowStage): "default" | "secondary" | "destructive" | "outline" {
  if (stage === "waitlisted") return "destructive"
  if (stage === "grantee_selected" || stage === "office_assigned") return "default"
  if (stage === "interview_scheduled" || stage === "exam_scheduled" || stage === "orientation_scheduled") {
    return "secondary"
  }
  return "outline"
}

export default function BatchManagement() {
  const [batches, setBatches] = useState<BatchListItem[]>([])
  const [workflows, setWorkflows] = useState<SpesWorkflowListItem[]>([])
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, AssignmentDraft>>({})

  const [loadingBatches, setLoadingBatches] = useState(true)
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [savingBatch, setSavingBatch] = useState(false)
  const [savingAssignmentWorkflowId, setSavingAssignmentWorkflowId] = useState<string | null>(null)

  const [batchError, setBatchError] = useState<string | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const [batchName, setBatchName] = useState("")
  const [startDate, setStartDate] = useState("")

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true)
    setBatchError(null)

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.BATCHES, {
        cache: "no-store",
      })
      const payload = (await response.json()) as BatchListResponse
      const fetchedBatches = payload.data?.batches

      if (!response.ok || !payload.success || !fetchedBatches) {
        throw new Error(payload.error || "Failed to load batches")
      }

      setBatches(fetchedBatches)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load batches"
      setBatchError(message)
      toast.error(message)
    } finally {
      setLoadingBatches(false)
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
      const fetchedWorkflows = payload.data?.workflows

      if (!response.ok || !payload.success || !fetchedWorkflows) {
        throw new Error(payload.error || "Failed to load workflows")
      }

      setWorkflows(fetchedWorkflows)
      setAssignmentDrafts(
        fetchedWorkflows.reduce<Record<string, AssignmentDraft>>((acc, workflow) => {
          acc[workflow.workflowId] = toAssignmentDraft(workflow)
          return acc
        }, {})
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workflows"
      setWorkflowError(message)
      toast.error(message)
    } finally {
      setLoadingWorkflows(false)
    }
  }, [])

  useEffect(() => {
    void loadBatches()
    void loadWorkflows()
  }, [loadBatches, loadWorkflows])

  const submitBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingBatch(true)

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.BATCHES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          startDate,
        }),
      })
      const payload = (await response.json()) as CreateBatchResponse
      const createdBatch = payload.data?.batch

      if (!response.ok || !payload.success || !createdBatch) {
        throw new Error(payload.error || "Failed to create batch")
      }

      setBatches((current) => [createdBatch, ...current])
      setBatchName("")
      setStartDate("")
      toast.success("Batch created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create batch")
    } finally {
      setSavingBatch(false)
    }
  }

  const updateAssignmentDraft = (
    workflowId: string,
    updater: (current: AssignmentDraft) => AssignmentDraft
  ) => {
    setAssignmentDrafts((current) => {
      const existing = current[workflowId]
      if (!existing) return current

      return {
        ...current,
        [workflowId]: updater(existing),
      }
    })
  }

  const hasAssignmentChanges = (workflow: SpesWorkflowListItem): boolean => {
    const draft = assignmentDrafts[workflow.workflowId]
    if (!draft) return false

    const nextBatchId = draft.batchId || null
    const nextOffice = normalizeOffice(draft.assignedOffice)

    return nextBatchId !== workflow.batchId || nextOffice !== workflow.assignedOffice
  }

  const saveAssignment = async (workflowId: string) => {
    const workflow = workflows.find((entry) => entry.workflowId === workflowId)
    const draft = assignmentDrafts[workflowId]

    if (!workflow || !draft) return

    const nextBatchId = draft.batchId || null
    const nextOffice = normalizeOffice(draft.assignedOffice)

    const assignmentPayload: {
      batchId?: string | null
      assignedOffice?: string | null
    } = {}

    if (nextBatchId !== workflow.batchId) {
      assignmentPayload.batchId = nextBatchId
    }

    if (nextOffice !== workflow.assignedOffice) {
      assignmentPayload.assignedOffice = nextOffice
    }

    if (Object.keys(assignmentPayload).length === 0) {
      toast.info("No assignment changes to save")
      return
    }

    setSavingAssignmentWorkflowId(workflowId)

    try {
      const response = await fetch(`${ROUTES.API.ADMIN.SPES.WORKFLOWS}/${workflowId}/assignment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentPayload),
      })

      const payload = (await response.json()) as WorkflowAssignmentResponse
      const updatedWorkflow = payload.data?.workflow

      if (!response.ok || !payload.success || !updatedWorkflow) {
        throw new Error(payload.error || "Failed to update assignment")
      }

      setWorkflows((current) =>
        current.map((entry) => (entry.workflowId === workflowId ? updatedWorkflow : entry))
      )
      setAssignmentDrafts((current) => ({
        ...current,
        [workflowId]: toAssignmentDraft(updatedWorkflow),
      }))

      toast.success("Assignment updated")
      await loadBatches()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update assignment")
    } finally {
      setSavingAssignmentWorkflowId(null)
    }
  }

  const assignableWorkflows = useMemo(
    () =>
      workflows.filter(
        (workflow) =>
          workflow.isGrantee ||
          workflow.examResult === "passed" ||
          workflow.batchId !== null ||
          workflow.assignedOffice !== null
      ),
    [workflows]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Management</h1>
        <p className="text-muted-foreground">
          Create batches for SPES grantees and assign deployment offices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Builder</CardTitle>
          <CardDescription>
            Create SPES batches and maintain deployment capacity for grantees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitBatch} className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <div className="grid gap-2">
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                placeholder="e.g., SPES 2026 Batch A"
                value={batchName}
                onChange={(event) => setBatchName(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batchStartDate">Start Date</Label>
              <Input
                id="batchStartDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={savingBatch}>
              {savingBatch && <Spinner data-icon="inline-start" />}
              Create Batch
            </Button>
          </form>

          {loadingBatches ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" />
              Loading batches...
            </div>
          ) : batchError ? (
            <p className="text-sm text-destructive">{batchError}</p>
          ) : batches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Grantees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.batchId}>
                    <TableCell>{batch.batchName}</TableCell>
                    <TableCell>{batch.startDate}</TableCell>
                    <TableCell>{batch.officeName || "Unassigned"}</TableCell>
                    <TableCell>{batch.granteeCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No batches yet. Create your first SPES batch.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Assignment</CardTitle>
          <CardDescription>
            Assign grantees and qualified workflows to batches and offices. Save per row to trigger notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingWorkflows ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" />
              Loading workflows...
            </div>
          ) : workflowError ? (
            <p className="text-sm text-destructive">{workflowError}</p>
          ) : assignableWorkflows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grantee or qualified workflows available for assignment yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Assigned Office</TableHead>
                  <TableHead>Current Assignment</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignableWorkflows.map((workflow) => {
                  const draft = assignmentDrafts[workflow.workflowId]
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
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={getStageBadgeVariant(workflow.stage)}>
                            {WORKFLOW_STAGE_LABELS[workflow.stage]}
                          </Badge>
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
                          {workflow.isGrantee && <Badge>Grantee</Badge>}
                          {workflow.isWaitlisted && <Badge variant="destructive">Waitlisted</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="h-9 min-w-44 rounded-md border border-input bg-background px-2 text-sm"
                          value={draft.batchId}
                          onChange={(event) =>
                            updateAssignmentDraft(workflow.workflowId, (current) => ({
                              ...current,
                              batchId: event.target.value,
                            }))
                          }
                        >
                          <option value="">Unassigned</option>
                          {batches.map((batch) => (
                            <option key={batch.batchId} value={batch.batchId}>
                              {batch.batchName}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={draft.assignedOffice}
                          placeholder="e.g., PESO Main Office"
                          onChange={(event) =>
                            updateAssignmentDraft(workflow.workflowId, (current) => ({
                              ...current,
                              assignedOffice: event.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Batch: {workflow.batchName || "Unassigned"}
                        <br />
                        Office: {workflow.assignedOffice || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void saveAssignment(workflow.workflowId)}
                          disabled={
                            savingAssignmentWorkflowId === workflow.workflowId ||
                            !hasAssignmentChanges(workflow)
                          }
                        >
                          {savingAssignmentWorkflowId === workflow.workflowId && (
                            <Spinner data-icon="inline-start" />
                          )}
                          Save Assignment
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
