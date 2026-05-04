import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import {
  DOCUMENT_TYPES,
  type DocumentType,
  buildProtectedUploadUrl,
} from "@/lib/upload-documents"

const f = createUploadthing()
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

async function getSessionFromRequestHeaders(requestHeaders: Headers) {
  return auth.api.getSession({ headers: requestHeaders })
}

export const uploadRouter = {
  spesApplicantDocument: f(
    {
      pdf: {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
    },
    {
      awaitServerData: true,
    },
  )
    .input(
      z.object({
        documentType: z.enum(DOCUMENT_TYPES),
      }),
    )
    .middleware(async ({ req, input, files }) => {
      const session = await getSessionFromRequestHeaders(req.headers)
      if (!session?.user) {
        throw new UploadThingError("Unauthorized")
      }

      const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES)
      if (oversized) {
        throw new UploadThingError("File too large. Maximum size is 10MB.")
      }

      return {
        userId: session.user.id,
        documentType: input.documentType,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const profile = await prisma.profileUser.findUnique({
        where: { userId: metadata.userId },
        include: { documents: true },
      })

      if (!profile) {
        throw new UploadThingError("Profile not found")
      }

      const now = new Date().toISOString()
      const existingDocuments =
        (profile.documents?.documents as Record<string, unknown>) || {}

      const updatedDocuments = {
        ...existingDocuments,
        [metadata.documentType]: {
          key: file.key,
          url: buildProtectedUploadUrl(file.key),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: now,
        },
      }

      if (profile.documents) {
        await prisma.profileDocuments.update({
          where: { profileId: profile.profileId },
          data: { documents: updatedDocuments as Prisma.InputJsonValue },
        })
      } else {
        await prisma.profileDocuments.create({
          data: {
            documentId: randomUUID(),
            profileId: profile.profileId,
            documents: updatedDocuments as Prisma.InputJsonValue,
          },
        })
      }

      return {
        key: file.key,
        url: buildProtectedUploadUrl(file.key),
        documentType: metadata.documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: now,
      }
    }),

  spesRemarkAttachment: f(
    {
      image: {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
      pdf: {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
    },
    {
      awaitServerData: true,
    },
  )
    .middleware(async ({ req, files }) => {
      const session = await getSessionFromRequestHeaders(req.headers)
      const role = session?.user
        ? (session.user as Record<string, unknown>).role
        : undefined

      if (!session?.user || role !== "admin") {
        throw new UploadThingError("Unauthorized")
      }

      const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES)
      if (oversized) {
        throw new UploadThingError("File too large. Maximum size is 10MB.")
      }

      return { adminId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return {
        key: file.key,
        url: buildProtectedUploadUrl(file.key),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

export type ApplicantUploadServerData = {
  key: string
  url: string
  documentType: DocumentType
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export type RemarkUploadServerData = {
  key: string
  url: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}
