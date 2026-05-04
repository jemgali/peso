import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteManagedFileByKey } from "@/lib/upload-storage";

interface RouteParams {
  params: Promise<{ key: string }>;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function DELETE(
  _request: NextRequest,
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

    const profile = await prisma.profileUser.findUnique({
      where: { userId },
      include: { documents: true },
    });

    if (!profile?.documents) {
      return NextResponse.json(
        {
          success: false,
          message: "File not found",
          error: "Document record was not found",
        },
        { status: 404 }
      );
    }

    const existingDocuments =
      (profile.documents.documents as Record<string, unknown>) || {};
    const matchingEntry = Object.entries(existingDocuments).find(([, value]) => {
      if (!value || typeof value !== "object") return false;
      return (value as { key?: string }).key === decodedKey;
    });

    if (!matchingEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
          error: "You can only delete your own files",
        },
        { status: 403 }
      );
    }

    const [documentType] = matchingEntry;

    await deleteManagedFileByKey(decodedKey);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [documentType]: _, ...remainingDocuments } = existingDocuments;

    await prisma.profileDocuments.update({
      where: { profileId: profile.profileId },
      data: { documents: remainingDocuments as Prisma.InputJsonValue },
    });

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
