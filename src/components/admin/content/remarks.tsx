"use client"

import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { RemarksTableSkeleton } from "@/components/ui/skeletons"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ClipboardListIcon, ChevronDown, ChevronUp, UploadIcon, XIcon } from "lucide-react"
import type { SpesGranteeWithRemarks, GranteeRemarksListResponse } from "@/lib/validations/spes-remarks"
import { useUploadThing } from "@/lib/uploadthing"
import type { RemarkUploadServerData } from "@/app/api/uploadthing/core"

export default function RemarksContent() {
  const [grantees, setGrantees] = useState<SpesGranteeWithRemarks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<string, "history" | "form">>({})

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const CRITERIA_LABELS: Record<string, string> = {
    punctuality: "Punctuality",
    respect: "Respect for Rules & Authority",
    honesty: "Honesty",
    adaptability: "Adaptability to Environment",
    expression: "Self-expression",
    initiative: "Initiative",
    following: "Following Instructions",
    efficiency: "Efficiency",
    creativity: "Creativity",
  }

  const [scores, setScores] = useState({
    punctuality: { value: 5, comment: "" },
    respect: { value: 5, comment: "" },
    honesty: { value: 5, comment: "" },
    adaptability: { value: 5, comment: "" },
    expression: { value: 5, comment: "" },
    initiative: { value: 5, comment: "" },
    following: { value: 5, comment: "" },
    efficiency: { value: 5, comment: "" },
    creativity: { value: 5, comment: "" },
  })
  const [remarksText, setRemarksText] = useState("")
  const [ratedBy, setRatedBy] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const { startUpload: startRemarkAttachmentUpload } = useUploadThing("spesRemarkAttachment")

  const loadGrantees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search.trim()) {
        params.set("search", search.trim())
      }
      const response = await fetch(`/api/admin/spes/remarks?${params.toString()}`)
      const payload = (await response.json()) as GranteeRemarksListResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load grantees")
      }
      setGrantees(payload.data.grantees)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load grantees"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadGrantees()
    }, 250)
    return () => clearTimeout(timer)
  }, [loadGrantees])

  const toggleHistory = (workflowId: string) => {
    setExpandedRows((prev) => {
      const next = { ...prev }
      if (next[workflowId] === "history") {
        delete next[workflowId]
      } else {
        next[workflowId] = "history"
      }
      return next
    })
  }

  const toggleForm = (workflowId: string) => {
    setExpandedRows((prev) => {
      const next = { ...prev }
      if (next[workflowId] === "form") {
        delete next[workflowId]
      } else {
        next[workflowId] = "form"
        setSelectedWorkflowId(workflowId)
        setScores({
          punctuality: { value: 5, comment: "" },
          respect: { value: 5, comment: "" },
          honesty: { value: 5, comment: "" },
          adaptability: { value: 5, comment: "" },
          expression: { value: 5, comment: "" },
          initiative: { value: 5, comment: "" },
          following: { value: 5, comment: "" },
          efficiency: { value: 5, comment: "" },
          creativity: { value: 5, comment: "" },
        })
        setRemarksText("")
        setRatedBy("")
        setUploadFile(null)
      }
      return next
    })
  }

  const handleScoreValueChange = (field: keyof typeof scores, value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1 || num > 5) return
    setScores((prev) => ({ ...prev, [field]: { ...prev[field], value: num } }))
  }

  const handleScoreCommentChange = (field: keyof typeof scores, value: string) => {
    setScores((prev) => ({ ...prev, [field]: { ...prev[field], comment: value } }))
  }

  const submitRemark = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedWorkflowId) return
    if (!ratedBy.trim()) {
      toast.error("Rated By is required")
      return
    }

    setSubmitting(true)
    try {
      let documentUrl = null
      if (uploadFile) {
        const uploadResult = await startRemarkAttachmentUpload([uploadFile])
        const uploaded = uploadResult?.[0]?.serverData as RemarkUploadServerData | null

        if (!uploaded?.url) {
          throw new Error("Failed to upload document")
        }

        documentUrl = uploaded.url
      }

      let formattedRemarks = remarksText.trim()
      const criteriaComments = Object.entries(scores)
        .filter(([_, data]) => data.comment.trim())
        .map(([key, data]) => `${CRITERIA_LABELS[key]}: ${data.comment.trim()}`)
      
      if (criteriaComments.length > 0) {
        formattedRemarks = criteriaComments.join("\n") + (formattedRemarks ? `\n\nOverall Remarks:\n${formattedRemarks}` : "")
      }

      const payloadScores = {
        punctuality: scores.punctuality.value,
        respect: scores.respect.value,
        honesty: scores.honesty.value,
        adaptability: scores.adaptability.value,
        expression: scores.expression.value,
        initiative: scores.initiative.value,
        following: scores.following.value,
        efficiency: scores.efficiency.value,
        creativity: scores.creativity.value,
      }

      const response = await fetch("/api/admin/spes/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          ...payloadScores,
          remarks: formattedRemarks || undefined,
          ratedBy: ratedBy.trim(),
          documentUrl,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save remark")
      }

      toast.success("Remark/Violation record saved successfully")
      setExpandedRows((prev) => {
        const next = { ...prev }
        next[selectedWorkflowId] = "history"
        return next
      })
      await loadGrantees()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save remark")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedGrantee = grantees.find((g) => g.workflowId === selectedWorkflowId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Remarks & Records of Violation</h1>
        <p className="text-muted-foreground">
          View history and add new remarks or violation records for SPES Grantees.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Search grantee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:max-w-sm"
            />
          </div>

          {loading ? (
            <RemarksTableSkeleton />
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : grantees.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardListIcon />
                </EmptyMedia>
                <EmptyTitle>No grantees found</EmptyTitle>
                <EmptyDescription>Try adjusting your search criteria.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Records Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grantees.map((grantee) => {
                    const viewState = expandedRows[grantee.workflowId]
                    return (
                      <Fragment key={grantee.workflowId}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleHistory(grantee.workflowId)}>
                          <TableCell>
                            {viewState ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </TableCell>
                          <TableCell className="font-medium">{grantee.applicantName}</TableCell>
                          <TableCell>{grantee.records.length}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant={viewState === "form" ? "default" : "outline"} onClick={(e) => {
                              e.stopPropagation()
                              toggleForm(grantee.workflowId)
                            }}>
                              {viewState === "form" ? "Cancel" : "Add Remark"}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {viewState === "history" && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={4} className="p-0">
                              <div className="p-4 border-t">
                                {grantee.records.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No past remarks or violations recorded.</p>
                                ) : (
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Past Remarks / Violations History</h4>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                      {grantee.records.map((record) => (
                                        <Card key={record.recordId}>
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">
                                              Year: {record.applicationYear || "N/A"}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                              Office: {record.assignedOffice || "N/A"}
                                            </CardDescription>
                                          </CardHeader>
                                          <CardContent className="text-xs space-y-2 pb-4">
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                              <span>Punctuality: {record.punctuality}/5</span>
                                              <span>Respect: {record.respect}/5</span>
                                              <span>Honesty: {record.honesty}/5</span>
                                              <span>Adaptability: {record.adaptability}/5</span>
                                              <span>Expression: {record.expression}/5</span>
                                              <span>Initiative: {record.initiative}/5</span>
                                              <span>Following Inst.: {record.following}/5</span>
                                              <span>Efficiency: {record.efficiency}/5</span>
                                              <span>Creativity: {record.creativity}/5</span>
                                            </div>
                                            {record.remarks && (
                                              <div className="mt-2 border-t pt-2">
                                                <span className="font-medium">Comments:</span> {record.remarks}
                                              </div>
                                            )}
                                            <div className="text-muted-foreground mt-2 pt-2 border-t">
                                              Rated By: {record.ratedBy} <br/>
                                              Date: {new Date(record.createdAt).toLocaleDateString()}
                                            </div>
                                            {record.documentUrl && (
                                              <a
                                                href={record.documentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 inline-flex items-center text-blue-500 hover:underline"
                                              >
                                                View Document
                                              </a>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {viewState === "form" && (
                          <TableRow className="bg-muted/10">
                            <TableCell colSpan={4} className="p-0">
                              <div className="p-4 border-t">
                                <div className="mb-6">
                                  <h4 className="font-medium text-lg">Add Remark / Violation Record</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Evaluate <span className="font-semibold text-foreground">{grantee.applicantName}</span>. Rate from 1 (Poor) to 5 (Excellent).
                                  </p>
                                </div>
                                <form onSubmit={submitRemark} className="space-y-6">
                                  <div className="space-y-4">
                                    {Object.keys(scores).map((key) => (
                                      <div key={key} className="rounded-lg border p-4 bg-background flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 space-y-2">
                                          <Label className="font-semibold text-sm">{CRITERIA_LABELS[key]}</Label>
                                          <Textarea 
                                            placeholder={`Add a specific comment for ${CRITERIA_LABELS[key].toLowerCase()} (optional)...`}
                                            value={scores[key as keyof typeof scores].comment}
                                            onChange={(e) => handleScoreCommentChange(key as keyof typeof scores, e.target.value)}
                                            className="min-h-16 text-sm resize-none bg-background"
                                          />
                                        </div>
                                        <div className="w-full sm:w-28 space-y-2 flex flex-col shrink-0 justify-center">
                                          <Label className="text-sm">Score (1-5)</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={scores[key as keyof typeof scores].value}
                                            onChange={(e) => handleScoreValueChange(key as keyof typeof scores, e.target.value)}
                                            required
                                            className="bg-background"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Other Comments/Suggestions</Label>
                                    <Textarea
                                      placeholder="Any additional remarks or violation details..."
                                      value={remarksText}
                                      onChange={(e) => setRemarksText(e.target.value)}
                                      className="bg-background"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Rated By</Label>
                                    <Input
                                      placeholder="Name of evaluating officer..."
                                      value={ratedBy}
                                      onChange={(e) => setRatedBy(e.target.value)}
                                      required
                                      className="bg-background"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Scanned Evaluation Document (Optional)</Label>
                                    {!uploadFile ? (
                                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/40 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <UploadIcon className="size-8 mb-3 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                          </p>
                                          <p className="text-xs text-muted-foreground">PDF or Image</p>
                                        </div>
                                        <Input
                                          type="file"
                                          className="hidden"
                                          accept="application/pdf,image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) setUploadFile(file)
                                          }}
                                          key={viewState === "form" ? "open" : "closed"}
                                        />
                                      </label>
                                    ) : (
                                      <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="p-2 bg-primary/10 text-primary rounded-md">
                                            <ClipboardListIcon className="size-5" />
                                          </div>
                                          <div className="truncate">
                                            <p className="text-sm font-medium truncate">{uploadFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setUploadFile(null)}
                                        >
                                          <XIcon className="size-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => toggleForm(grantee.workflowId)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                      {submitting && <Spinner data-icon="inline-start" />}
                                      Submit Evaluation
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
