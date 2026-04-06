import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProgramSchema } from "@/lib/validations/program"

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const program = await prisma.program.findUnique({
      where: { id },
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateProgramSchema.parse({ ...body, id })

    const existingProgram = await prisma.program.findUnique({
      where: { id },
    })

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description !== undefined ? validated.description || null : undefined,
        image: validated.image !== undefined ? validated.image || null : undefined,
        link: validated.link !== undefined ? validated.link || null : undefined,
        status: validated.status,
        order: validated.order,
      },
    })

    return NextResponse.json({ program })
  } catch (error) {
    console.error("Error updating program:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const existingProgram = await prisma.program.findUnique({
      where: { id },
    })

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    await prisma.program.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    )
  }
}
