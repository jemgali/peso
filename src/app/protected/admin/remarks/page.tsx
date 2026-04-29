import React from "react"
import type { Metadata } from "next"
import RemarksContent from "@/components/admin/content/remarks"

export const metadata: Metadata = {
  title: "Remarks & Records of Violation | SPES | PESO",
  description: "Manage remarks and records of violation for SPES grantees.",
}

export default function AdminSpesRemarksPage() {
  return <RemarksContent />
}
