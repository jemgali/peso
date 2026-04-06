import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: for public bucket access

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Allowed file types for documents
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Document types that can be uploaded
export const DOCUMENT_TYPES = [
  "psaCertificate",
  "schoolId",
  "grades",
  "barangayCertificate",
  "fourPsId",
  "medicalCertificate",
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

// Upload a file to R2
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return the file URL
  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : await getSignedUrl(r2Client, new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }), {
        expiresIn: 3600 * 24 * 7, // 7 days
      });

  return { key, url };
}

// Delete a file from R2
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

// Get a signed URL for a private file
export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
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
