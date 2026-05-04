import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { readFile, fileExists, getMimeType } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import {
  getSignedManagedFileUrl,
  isLegacyLocalStorageKey,
} from "@/lib/upload-storage";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Get the current authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { path } = await params;
    const key = decodeURIComponent(path.join("/"));

    const userId = session.user.id;
    const userRole = (session.user as Record<string, unknown>).role as
      | string
      | undefined;
    const isAdmin = userRole === "admin";

    if (!isAdmin) {
      const profile = await prisma.profileUser.findUnique({
        where: { userId },
        include: { documents: true },
      });

      const documents =
        (profile?.documents?.documents as Record<string, unknown>) || {};
      const isOwner = Object.values(documents).some((value) => {
        if (!value || typeof value !== "object") return false;
        return (value as { key?: string }).key === key;
      });

      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    if (isLegacyLocalStorageKey(key)) {
      const exists = await fileExists(key);
      if (!exists) {
        return NextResponse.json(
          { success: false, error: "File not found" },
          { status: 404 }
        );
      }

      const buffer = await readFile(key);
      const mimeType = getMimeType(key);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const signedUrl = await getSignedManagedFileUrl(key);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
