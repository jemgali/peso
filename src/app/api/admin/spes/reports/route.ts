import { NextResponse } from "next/server"
import { headers, cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { ADMIN_SERVICE_COOKIE, isAdminService } from "@/lib/constants/admin-service"
import { getSpesReportsData } from "@/lib/utils/spes-reports"
import {
  listSpesReportsQuerySchema,
  type SpesReportsResponse,
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

export async function GET(request: Request): Promise<NextResponse<SpesReportsResponse>> {
  if (!(await canAccessSpesReports())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - SPES admin context required" },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const parsed = listSpesReportsQuerySchema.safeParse({
    year: searchParams.get("year") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid report query" },
      { status: 400 }
    )
  }

  try {
    const report = await getSpesReportsData(parsed.data.year)
    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error("[GET_SPES_REPORTS_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate reports" },
      { status: 500 }
    )
  }
}
