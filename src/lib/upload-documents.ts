export const DOCUMENT_TYPES = [
  "psaCertificate",
  "proofOfEnrollment",
  "grades",
  "affidavitLowIncome",
  "barangayCertLowIncome",
  "barangayCertResidency",
  "outOfSchoolYouthCertificate",
  "certificateOfGuardianship",
  "incomeTaxReturn",
  "certificateOfMarriage",
  "affidavitSoloParent",
  "affidavitDiscrepancy",
  "deathCertificate",
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value)
}

export function buildProtectedUploadUrl(key: string): string {
  return `/api/upload/file/${encodeURIComponent(key)}`
}

