import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  uploadFile,
  generateFileKey,
  validateFile,
  DOCUMENT_TYPES,
  type DocumentType,
} from "@/lib/r2";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    key: string;
    url: string;
    documentType: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
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
          error: "You must be logged in to upload files",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
          error: "Please select a file to upload",
        },
        { status: 400 }
      );
    }

    if (!documentType || !DOCUMENT_TYPES.includes(documentType as DocumentType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type",
          error: `Document type must be one of: ${DOCUMENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile({ type: file.type, size: file.size });
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "File validation failed",
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Generate file key and upload
    const key = generateFileKey(userId, documentType as DocumentType, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadFile(buffer, key, file.type);

    // Get or create profile documents record
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
      include: { documents: true },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile not found",
          error: "You must create a profile before uploading documents",
        },
        { status: 404 }
      );
    }

    // Update documents JSON
    const existingDocuments = (profile.documents?.documents as Record<string, unknown>) || {};
    const updatedDocuments = {
      ...existingDocuments,
      [documentType]: {
        key,
        url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      },
    };

    if (profile.documents) {
      await prisma.profileDocuments.update({
        where: { profileId: profile.profileId },
        data: { documents: updatedDocuments as Prisma.InputJsonValue },
      });
    } else {
      await prisma.profileDocuments.create({
        data: {
          documentId: randomUUID(),
          profileId: profile.profileId,
          documents: updatedDocuments as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        key,
        url,
        documentType,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
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
