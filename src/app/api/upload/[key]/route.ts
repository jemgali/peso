import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { deleteFile } from "@/lib/r2";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

interface RouteParams {
  params: Promise<{ key: string }>;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<DeleteResponse>> {
  try {
    // Get the current authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "You must be logged in to delete files",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { key } = await params;
    
    // Decode the key (it's URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Verify the file belongs to this user (key should start with documents/{userId}/)
    if (!decodedKey.startsWith(`documents/${userId}/`)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
          error: "You can only delete your own files",
        },
        { status: 403 }
      );
    }

    // Extract document type from key
    const keyParts = decodedKey.split("/");
    const documentType = keyParts[2]; // documents/{userId}/{documentType}/{filename}

    // Delete from R2
    await deleteFile(decodedKey);

    // Update profile documents to remove this file
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
      include: { documents: true },
    });

    if (profile?.documents) {
      const existingDocuments = (profile.documents.documents as Record<string, unknown>) || {};
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [documentType]: _, ...remainingDocuments } = existingDocuments;
      
      await prisma.profileDocuments.update({
        where: { profileId: profile.profileId },
        data: { documents: remainingDocuments as Prisma.InputJsonValue },
      });
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
