"use client"

import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ClipboardListIcon, ChevronDown, ChevronUp, FileWarning } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SpesGranteeWithRemarks, GranteeRemarksListResponse, GranteeRemarkItem } from "@/lib/validations/spes-remarks"

export default function RemarksContent() {
  const [grantees, setGrantees] = useState<SpesGranteeWithRemarks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [scores, setScores] = useState({
    punctuality: 5,
    respect: 5,
    honesty: 5,
    adaptability: 5,
    expression: 5,
    initiative: 5,
    following: 5,
    efficiency: 5,
    creativity: 5,
  })
  const [remarksText, setRemarksText] = useState("")
  const [ratedBy, setRatedBy] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)

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

  const toggleRow = (workflowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(workflowId)) {
        next.delete(workflowId)
      } else {
        next.add(workflowId)
      }
      return next
    })
  }

  const openForm = (workflowId: string) => {
    setSelectedWorkflowId(workflowId)
    setScores({
      punctuality: 5,
      respect: 5,
      honesty: 5,
      adaptability: 5,
      expression: 5,
      initiative: 5,
      following: 5,
      efficiency: 5,
      creativity: 5,
    })
    setRemarksText("")
    setRatedBy("")
    setUploadFile(null)
    setFormOpen(true)
  }

  const handleScoreChange = (field: keyof typeof scores, value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1 || num > 5) return
    setScores((prev) => ({ ...prev, [field]: num }))
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
        const formData = new FormData()
        formData.append("file", uploadFile)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload document")
        }
        documentUrl = uploadData.url
      }

      const response = await fetch("/api/admin/spes/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          ...scores,
          remarks: remarksText.trim() || undefined,
          ratedBy: ratedBy.trim(),
          documentUrl,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save remark")
      }

      toast.success("Remark/Violation record saved successfully")
      setFormOpen(false)
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" />
              Loading records...
            </div>
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
                    const isExpanded = expandedRows.has(grantee.workflowId)
                    return (
                      <Fragment key={grantee.workflowId}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(grantee.workflowId)}>
                          <TableCell>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium">{grantee.applicantName}</TableCell>
                          <TableCell>{grantee.records.length}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation()
                              openForm(grantee.workflowId)
                            }}>
                              Add Remark
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={4} className="p-0">
                              <div className="p-4">
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
                                            <div className="text-muted-foreground">
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
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Remark / Violation Record</DialogTitle>
            <DialogDescription>
              Evaluate <span className="font-semibold text-foreground">{selectedGrantee?.applicantName}</span>. Rate from 1 (Poor) to 5 (Excellent).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitRemark} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(scores).map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) => handleScoreChange(key as keyof typeof scores, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Other Comments/Suggestions</Label>
              <Textarea
                placeholder="Any additional remarks or violation details..."
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rated By</Label>
              <Input
                placeholder="Name of evaluating officer..."
                value={ratedBy}
                onChange={(e) => setRatedBy(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Scanned Evaluation Document (Optional)</Label>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setUploadFile(file)
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Spinner data-icon="inline-start" />}
                Submit Evaluation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
