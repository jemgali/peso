import { google } from "googleapis"
import type { SpesReportsData } from "@/lib/validations/spes-reports"

const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
const GOOGLE_SHEETS_SHEET_TITLE_MAX_LENGTH = 100

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function normalizePrivateKey(value: string): string {
  const trimmed = value.trim()
  const withoutWrappingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed

  return withoutWrappingQuotes.replace(/\\n/g, "\n")
}

function buildSheetTitle(selectedYear: number): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const nonce = Math.random().toString(36).slice(2, 8)
  const title = `SPES-${selectedYear}-${timestamp}-${nonce}`
    .replace(/[:\\/?*\[\]]/g, "-")
    .slice(0, GOOGLE_SHEETS_SHEET_TITLE_MAX_LENGTH)
    .trim()

  if (!title) {
    throw new Error("Failed to generate a valid Google Sheet title")
  }

  return title
}

function buildRows(report: SpesReportsData): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = []

  rows.push(["PESO SPES Reports"])
  rows.push(["Generated At", report.generatedAt])
  rows.push(["Selected Year", report.selectedYear])
  rows.push([])

  rows.push(["Summary"])
  rows.push(["Metric", "Value"])
  rows.push(["Total Applications", report.summary.totalApplications])
  rows.push(["Pending Applications", report.summary.pendingApplications])
  rows.push(["Approved Applications", report.summary.approvedApplications])
  rows.push(["Needs Revision Applications", report.summary.needsRevisionApplications])
  rows.push(["Rejected Applications", report.summary.rejectedApplications])
  rows.push(["Total Workflows", report.summary.totalWorkflows])
  rows.push(["Grantee Count", report.summary.granteeCount])
  rows.push(["Waitlisted Count", report.summary.waitlistedCount])
  rows.push(["Denied Count", report.summary.deniedCount])
  rows.push(["Assigned Office Count", report.summary.assignedOfficeCount])
  rows.push(["Active Batch Count", report.summary.activeBatchCount])
  rows.push(["Average Grantee Score", report.summary.averageGranteeScore ?? "N/A"])
  rows.push([])

  rows.push(["Applications by Status"])
  rows.push(["Status", "Count"])
  for (const row of report.applicationStatusCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Applicant Categories"])
  rows.push(["Category", "Count"])
  for (const row of report.applicantCategoryCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Monthly Applications"])
  rows.push(["Month", "Total", "Approved", "Rejected", "Needs Revision"])
  for (const row of report.monthlyApplicationTrend) {
    rows.push([row.month, row.total, row.approved, row.rejected, row.needsRevision])
  }
  rows.push([])

  rows.push(["Workflow Selection Status"])
  rows.push(["Status", "Count"])
  for (const row of report.workflowSelectionStatusCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Workflow Stages"])
  rows.push(["Stage", "Count"])
  for (const row of report.workflowStageCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Workflow Exam Results"])
  rows.push(["Result", "Count"])
  for (const row of report.workflowExamResultCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Office Assignments"])
  rows.push(["Office", "Count"])
  for (const row of report.officeAssignmentCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Batch Assignments"])
  rows.push(["Batch", "Count"])
  for (const row of report.batchAssignmentCounts) {
    rows.push([row.label, row.count])
  }
  rows.push([])

  rows.push(["Average Trait Scores"])
  rows.push(["Trait", "Average"])
  for (const row of report.averageTraitScores) {
    rows.push([row.label, row.average])
  }
  rows.push([])

  rows.push(["Recent Applications"])
  rows.push(["Submission ID", "Applicant", "Applicant Type", "Status", "Submitted At"])
  for (const row of report.recentApplications) {
    rows.push([row.submissionId, row.applicantName, row.applicantType, row.status, row.submittedAt])
  }
  rows.push([])

  rows.push(["Top Grantee Scores"])
  rows.push(["Record ID", "Workflow ID", "Applicant", "Average Score", "Office", "Batch", "Rated By", "Created At"])
  for (const row of report.topGranteeScores) {
    rows.push([
      row.recordId,
      row.workflowId,
      row.applicantName,
      row.averageScore,
      row.assignedOffice ?? "",
      row.batchName ?? "",
      row.ratedBy,
      row.createdAt,
    ])
  }

  return rows
}

export async function exportSpesReportsToGoogleSheets(
  report: SpesReportsData,
  options?: { spreadsheetId?: string }
): Promise<{ spreadsheetId: string; sheetTitle: string; updatedCells: number }> {
  const spreadsheetId = options?.spreadsheetId?.trim() || getRequiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID")
  const clientEmail = getRequiredEnv("GOOGLE_SHEETS_CLIENT_EMAIL")
  const privateKey = normalizePrivateKey(getRequiredEnv("GOOGLE_SHEETS_PRIVATE_KEY"))

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [GOOGLE_SHEETS_SCOPE],
  })
  const sheets = google.sheets({ version: "v4", auth })

  const sheetTitle = buildSheetTitle(report.selectedYear)
  const rows = buildRows(report)

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetTitle },
            },
          },
        ],
      },
    })

    const updateResult = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetTitle}'!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    })

    return {
      spreadsheetId,
      sheetTitle,
      updatedCells: updateResult.data.updatedCells ?? 0,
    }
  } catch (error) {
    throw new Error("Failed to export SPES reports to Google Sheets", { cause: error })
  }
}
