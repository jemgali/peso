"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DownloadIcon, FileWarningIcon, RotateCcwIcon, SheetIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROUTES } from "@/lib/constants/routes"
import type {
  ExportSpesReportsResponse,
  SpesReportsData,
  SpesReportsResponse,
} from "@/lib/validations/spes-reports"
import { toast } from "sonner"

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  needs_revision: "Needs Revision",
  rejected: "Rejected",
}

const APPLICANT_TYPE_LABELS: Record<string, string> = {
  new: "New",
  spes_baby: "SPES Baby",
}

const SELECTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  waitlisted: "Waitlisted",
  grantee: "Grantee",
  denied: "Denied",
}

function getApplicationStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  if (status === "in_review") return "secondary"
  return "outline"
}

function ReportsLoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function Reports() {
  const currentYear = new Date().getUTCFullYear()
  const latestRequestRef = useRef(0)
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [report, setReport] = useState<SpesReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [createNew, setCreateNew] = useState(false)

  const fetchReports = useCallback(async (year: string) => {
    const requestId = ++latestRequestRef.current
    setLoading(true)
    setError(null)
    try {
      const endpoint = `${ROUTES.API.ADMIN.SPES.REPORTS}?year=${encodeURIComponent(year)}`
      const response = await fetch(endpoint, { cache: "no-store" })
      const payload = (await response.json()) as SpesReportsResponse
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load reports")
      }

      if (latestRequestRef.current !== requestId) return
      setReport(payload.data)
      setSelectedYear(String(payload.data.selectedYear))
    } catch (fetchError) {
      if (latestRequestRef.current !== requestId) return
      const message =
        fetchError instanceof Error ? fetchError.message : "Failed to load reports"
      setError(message)
    } finally {
      if (latestRequestRef.current !== requestId) return
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchReports(selectedYear)
    return () => {
      latestRequestRef.current += 1
    }
  }, [fetchReports, selectedYear])

  const yearOptions = useMemo(() => {
    if (!report) return [currentYear]
    const years = new Set(report.availableYears)
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [currentYear, report])

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.REPORTS_EXPORT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: Number.parseInt(selectedYear, 10),
          spreadsheetId: spreadsheetId.trim() || undefined,
          createNew: createNew,
        }),
      })
      const payload = (await response.json()) as ExportSpesReportsResponse
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to export report")
      }

      toast.success(`Exported to Google Sheets tab ${payload.data.sheetTitle}`)
      if (createNew || !spreadsheetId) {
        setSpreadsheetId(payload.data.spreadsheetId)
        setCreateNew(false)
      }
    } catch (exportError) {
      const message =
        exportError instanceof Error ? exportError.message : "Failed to export report"
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  const monthlyChartConfig = {
    total: { label: "Total", color: "var(--chart-1)" },
    approved: { label: "Approved", color: "var(--chart-2)" },
    rejected: { label: "Rejected", color: "var(--chart-4)" },
  } satisfies ChartConfig

  const statusChartConfig = {
    count: { label: "Count", color: "var(--chart-1)" },
  } satisfies ChartConfig

  if (loading) {
    return <ReportsLoadingState />
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarningIcon />
          </EmptyMedia>
          <EmptyTitle>Failed to load reports</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => void fetchReports(selectedYear)}>
            <RotateCcwIcon data-icon="inline-start" />
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!report) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SheetIcon />
          </EmptyMedia>
          <EmptyTitle>No report data available</EmptyTitle>
          <EmptyDescription>
            No report snapshot was returned by the server.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const workflowStages = report.workflowStageCounts.filter((item) => item.count > 0)
  const officeAssignments = report.officeAssignmentCounts.slice(0, 10)
  const batchAssignments = report.batchAssignmentCounts.slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="SPES analytics dashboard with Google Sheets export"
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <NativeSelect
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="w-full sm:w-[140px]"
            aria-label="Select report year"
          >
            {yearOptions.map((year) => (
              <NativeSelectOption key={year} value={String(year)}>
                {year}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <div className="flex w-full items-center gap-2 sm:w-[350px]">
            <Input
              type="text"
              placeholder="Target Spreadsheet ID"
              value={spreadsheetId}
              onChange={(e) => {
                setSpreadsheetId(e.target.value)
                if (e.target.value.trim()) setCreateNew(false)
              }}
              className="w-full"
              disabled={createNew}
            />
          </div>
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="createNew"
              checked={createNew}
              onCheckedChange={(checked) => setCreateNew(checked === true)}
            />
            <Label htmlFor="createNew" className="cursor-pointer">
              Create New
            </Label>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="w-full sm:w-auto">
            {exporting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            Export to Google Sheets
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
            <CardDescription>All submissions in selected year</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{report.summary.totalApplications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
            <CardDescription>Approved SPES applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{report.summary.approvedApplications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grantees</CardTitle>
            <CardDescription>Workflows marked as grantee</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{report.summary.granteeCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Grantee Score</CardTitle>
            <CardDescription>Based on remarks records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {report.summary.averageGranteeScore ?? "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <TabsList className="flex h-auto w-full flex-wrap gap-2" aria-label="Report sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Application Trend</CardTitle>
              <CardDescription>Total, approved, and rejected submissions by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyChartConfig} className="min-h-72 w-full">
                <BarChart accessibilityLayer data={report.monthlyApplicationTrend}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
                  <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
                <CardDescription>Current status spread for submitted applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={statusChartConfig} className="min-h-72 w-full">
                  <BarChart accessibilityLayer data={report.applicationStatusCounts}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: string) =>
                        APPLICATION_STATUS_LABELS[value] || value
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => <span>{value}</span>}
                          labelFormatter={(label) =>
                            APPLICATION_STATUS_LABELS[String(label)] || String(label)
                          }
                        />
                      }
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Selection Status</CardTitle>
                <CardDescription>Distribution across pending, grantee, waitlisted, denied</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={statusChartConfig} className="min-h-72 w-full">
                  <BarChart accessibilityLayer data={report.workflowSelectionStatusCounts}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: string) =>
                        SELECTION_STATUS_LABELS[value] || value
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => <span>{value}</span>}
                          labelFormatter={(label) =>
                            SELECTION_STATUS_LABELS[String(label)] || String(label)
                          }
                        />
                      }
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest submissions in selected year</CardDescription>
            </CardHeader>
            <CardContent>
              {report.recentApplications.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No recent applications</EmptyTitle>
                    <EmptyDescription>No submissions found for this year.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.recentApplications.map((item) => (
                      <TableRow key={item.submissionId}>
                        <TableCell className="font-mono text-xs">{item.submissionId}</TableCell>
                        <TableCell>{item.applicantName}</TableCell>
                        <TableCell>{APPLICANT_TYPE_LABELS[item.applicantType] || item.applicantType}</TableCell>
                        <TableCell>
                          <Badge variant={getApplicationStatusBadgeVariant(item.status)}>
                            {APPLICATION_STATUS_LABELS[item.status] || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.submittedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Categories</CardTitle>
                <CardDescription>New vs SPES baby submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.applicantCategoryCounts.map((item) => (
                      <TableRow key={item.label}>
                        <TableCell>{APPLICANT_TYPE_LABELS[item.label] || item.label}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status Totals</CardTitle>
                <CardDescription>Counts by review status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.applicationStatusCounts.map((item) => (
                      <TableRow key={item.label}>
                        <TableCell>{APPLICATION_STATUS_LABELS[item.label] || item.label}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Stage Counts</CardTitle>
                <CardDescription>How applicants are distributed by workflow stage</CardDescription>
              </CardHeader>
              <CardContent>
                {workflowStages.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No workflow stage data</EmptyTitle>
                      <EmptyDescription>
                        No workflow records found for this year.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflowStages.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell>{item.label.replaceAll("_", " ")}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Assignments</CardTitle>
                <CardDescription>Top offices with assigned grantees</CardDescription>
              </CardHeader>
              <CardContent>
                {officeAssignments.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No office assignments</EmptyTitle>
                      <EmptyDescription>
                        No workflows have assigned offices yet.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Office</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officeAssignments.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell>{item.label}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Batch Assignments</CardTitle>
              <CardDescription>Distribution of workflows by batch</CardDescription>
            </CardHeader>
            <CardContent>
              {batchAssignments.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No batch assignment data</EmptyTitle>
                    <EmptyDescription>No batch-linked workflows found.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchAssignments.map((item) => (
                      <TableRow key={item.label}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarks" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Trait Scores</CardTitle>
              <CardDescription>Average score per trait based on grantee records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trait</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.averageTraitScores.map((item) => (
                    <TableRow key={item.trait}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell className="text-right">{item.average}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Grantee Scores</CardTitle>
              <CardDescription>Latest scored records ranked by average score</CardDescription>
              <CardAction>
                <Badge variant="outline">{report.topGranteeScores.length} records</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              {report.topGranteeScores.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No grantee score records</EmptyTitle>
                    <EmptyDescription>No remarks records available for ranking.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Rated By</TableHead>
                      <TableHead>Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.topGranteeScores.map((item) => (
                      <TableRow key={item.recordId}>
                        <TableCell className="font-medium">{item.applicantName}</TableCell>
                        <TableCell>{item.averageScore}</TableCell>
                        <TableCell>{item.assignedOffice || "—"}</TableCell>
                        <TableCell>{item.batchName || "—"}</TableCell>
                        <TableCell>{item.ratedBy}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
