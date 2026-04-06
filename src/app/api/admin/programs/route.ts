import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProgramSchema } from "@/lib/validations/program"

async function requireAdminApi() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session || !session.user) {
    return null
  }

  const role = session.user.role || "client"
  if (role !== "admin") {
    return null
  }

  return session.user
}

export async function GET() {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const programs = await prisma.program.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({ programs })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = createProgramSchema.parse(body)

    const program = await prisma.program.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        image: validated.image || null,
        link: validated.link || null,
        status: validated.status,
        order: validated.order,
      },
    })

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    console.error("Error creating program:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    )
  }
}
