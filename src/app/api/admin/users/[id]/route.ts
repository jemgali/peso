import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { updateUserSchema } from "@/lib/validations/user"

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
    const validated = updateUserSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (existingUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot modify admin users" },
        { status: 403 }
      )
    }

    const emailUser = await prisma.user.findFirst({
      where: {
        email: validated.email,
        id: { not: id },
      },
    })

    if (emailUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      )
    }

    const fullName = [
      validated.firstName,
      validated.middleName,
      validated.lastName,
      validated.suffix,
    ]
      .filter(Boolean)
      .join(" ")

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: fullName,
        email: validated.email,
        role: validated.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    })

    if (validated.password && validated.password.length >= 8) {
      const hashedPassword = await hashPassword(validated.password)
      await prisma.account.updateMany({
        where: {
          userId: id,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update user" },
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

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (existingUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot archive admin users" },
        { status: 403 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: "Archived by admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error archiving user:", error)
    return NextResponse.json(
      { error: "Failed to archive user" },
      { status: 500 }
    )
  }
}
