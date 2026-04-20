import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

interface ProfileNameResponse {
  success: boolean;
  data?: {
    firstName: string | null;
    lastName: string | null;
  };
  error?: string;
}

export async function GET(): Promise<NextResponse<ProfileNameResponse>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await prisma.profileUser.findUnique({
      where: { userId: session.user.id },
      select: {
        profileFirstName: true,
        profileLastName: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        firstName: profile?.profileFirstName ?? null,
        lastName: profile?.profileLastName ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile name:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
