import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type BatchListItem,
  type BatchListResponse,
} from "@/lib/validations/spes-workflow";

async function getAdminUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return session.user.id;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Check if the batch has assigned workflows
    const batch = await prisma.spesBatch.findUnique({
      where: { batchId: id },
      include: {
        _count: {
          select: { workflows: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      );
    }

    if (batch._count.workflows > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete batch with assigned grantees. Remove all grantees first." },
        { status: 400 }
      );
    }

    await prisma.spesBatch.delete({
      where: { batchId: id },
    });

    return NextResponse.json({ success: true, message: "Batch deleted" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const payload = await request.json().catch(() => null);

  if (!payload || !payload.batchName || !payload.startDate) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const updatedBatch = await prisma.spesBatch.update({
      where: { batchId: id },
      data: {
        batchName: payload.batchName.trim(),
        startDate: new Date(payload.startDate),
        batchYear: parseInt(payload.startDate.split("-")[0] || "0", 10),
      },
    });

    return NextResponse.json({
      success: true,
      data: { batch: updatedBatch },
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error or batch not found" },
      { status: 500 }
    );
  }
}
