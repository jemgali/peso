import fs from "fs/promises";
import path from "path";

// Local filesystem storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// Allowed file types for documents
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Document types that can be uploaded
export const DOCUMENT_TYPES = [
  "psaCertificate",
  "grades",
  "affidavitLowIncome",
  "barangayCertLowIncome",
  "barangayCertResidency",
  "incomeTaxReturn",
  "affidavitSoloParent",
  "affidavitDiscrepancy",
  "deathCertificate",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Generate a unique file key for storage
export function generateFileKey(
  userId: string,
  documentType: DocumentType,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const extension = originalFilename.split(".").pop() || "file";
  return `documents/${userId}/${documentType}/${timestamp}.${extension}`;
}

// Resolve absolute path for a file key (with path traversal protection)
export function getFilePath(key: string): string {
  // Normalize and prevent path traversal
  const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(UPLOAD_DIR, normalized);

  // Ensure resolved path is within UPLOAD_DIR
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(UPLOAD_DIR);
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error("Invalid file path: path traversal detected");
  }

  return resolvedPath;
}

// Save a file to local filesystem
export async function saveFile(
  buffer: Buffer,
  key: string,
  _contentType: string
): Promise<{ key: string; url: string }> {
  const filePath = getFilePath(key);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(filePath, buffer);

  // Return the API-served URL
  const url = `/api/upload/file/${encodeURIComponent(key)}`;

  return { key, url };
}

// Delete a file from local filesystem
export async function deleteFile(key: string): Promise<void> {
  const filePath = getFilePath(key);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist (already deleted)
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

// Read a file from local filesystem
export async function readFile(key: string): Promise<Buffer> {
  const filePath = getFilePath(key);
  return fs.readFile(filePath);
}

// Check if a file exists
export async function fileExists(key: string): Promise<boolean> {
  try {
    const filePath = getFilePath(key);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Validate file type and size
export function validateFile(
  file: { type: string; size: number },
  allowedTypes: readonly string[] = ALLOWED_FILE_TYPES
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

// Get MIME type from file extension
export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
