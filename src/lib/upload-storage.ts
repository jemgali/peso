import { UTApi } from "uploadthing/server"
import { deleteFile } from "@/lib/storage"

let cachedUtApi: UTApi | null = null

function getUploadThingToken(): string {
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) {
    throw new Error("UPLOADTHING_TOKEN is not configured")
  }
  return token
}

function getUtApi(): UTApi {
  if (!cachedUtApi) {
    cachedUtApi = new UTApi({ token: getUploadThingToken() })
  }
  return cachedUtApi
}

export function isLegacyLocalStorageKey(key: string): boolean {
  return key.startsWith("documents/")
}

export async function deleteManagedFileByKey(key: string): Promise<void> {
  if (isLegacyLocalStorageKey(key)) {
    await deleteFile(key)
    return
  }

  await getUtApi().deleteFiles(key)
}

export async function getSignedManagedFileUrl(key: string): Promise<string> {
  const { ufsUrl } = await getUtApi().generateSignedURL(key)
  return ufsUrl
}

