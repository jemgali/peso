import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  ADMIN_SERVICE_COOKIE,
  isAdminService,
  type AdminService,
} from "@/lib/constants/admin-service"

interface ServiceContextResponse {
  success: boolean
  error?: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ServiceContextResponse>> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as { service?: string } | null
  const service = body?.service

  if (!isAdminService(service)) {
    return NextResponse.json(
      { success: false, error: "Invalid service selection" },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SERVICE_COOKIE, service as AdminService, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  return response
}

export async function DELETE(): Promise<NextResponse<ServiceContextResponse>> {
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SERVICE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}

