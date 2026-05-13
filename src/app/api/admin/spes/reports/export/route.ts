import { NextResponse } from "next/server"
import { headers, cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"
import { exportSpesReportsToGoogleSheets } from "@/lib/google-sheets"
import { getSpesReportsData } from "@/lib/utils/spes-reports"
import {
  exportSpesReportsSchema,
  type ExportSpesReportsResponse,
} from "@/lib/validations/spes-reports"

async function canAccessSpesReports(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    return false
  }

  const service = (await cookies()).get(ADMIN_SERVICE_COOKIE)?.value
  return isAdminService(service) && service === "spes"
}

export async function POST(request: Request): Promise<NextResponse<ExportSpesReportsResponse>> {
  if (!(await canAccessSpesReports())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - SPES admin context required" },
      { status: 403 }
    )
  }

  let payload: unknown = {}
  const rawBody = await request.text()
  if (rawBody.trim().length > 0) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      )
    }
  }

  const parsed = exportSpesReportsSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid export payload" },
      { status: 400 }
    )
  }

  try {
    const report = await getSpesReportsData(parsed.data.year)
    const exportResult = await exportSpesReportsToGoogleSheets(report, {
      spreadsheetId: parsed.data.spreadsheetId,
      createNew: parsed.data.createNew,
    })

    return NextResponse.json({
      success: true,
      data: {
        spreadsheetId: exportResult.spreadsheetId,
        sheetTitle: exportResult.sheetTitle,
        updatedCells: exportResult.updatedCells,
        report,
      },
    })
  } catch (error) {
    console.error("[EXPORT_SPES_REPORTS_ERROR]", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to export report" },
      { status: 500 }
    )
  }
}
