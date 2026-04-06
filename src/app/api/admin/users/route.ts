import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { createUserSchema } from "@/lib/validations/user"

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
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["employee", "client"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    const validated = createUserSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
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

    const hashedPassword = await hashPassword(validated.password)
    const userId = crypto.randomUUID()
    const accountId = crypto.randomUUID()

    const user = await prisma.user.create({
      data: {
        id: userId,
        name: fullName,
        email: validated.email,
        emailVerified: true,
        role: validated.role,
        accounts: {
          create: {
            id: accountId,
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
          },
        },
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

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
