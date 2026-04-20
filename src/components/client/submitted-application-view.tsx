"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import ApplicationStatusCard from "@/components/client/application-status-card"
import type { ApplicationStatus } from "@/lib/validations/application-review"
import { FileIcon } from "lucide-react"

interface SubmissionSummary {
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
}

type Snapshot = Record<string, unknown>

interface SubmittedApplicationViewProps {
  submission: SubmissionSummary
  snapshot: Snapshot
}

const DISPLAY_FIELDS: Array<{ key: string; label: string }> = [
  { key: "profileLastName", label: "Last Name" },
  { key: "profileFirstName", label: "First Name" },
  { key: "profileMiddleName", label: "Middle Name" },
  { key: "profileSuffix", label: "Suffix" },
  { key: "profileBirthdate", label: "Birthdate" },
  { key: "profileAge", label: "Age" },
  { key: "profilePlaceOfBirth", label: "Place of Birth" },
  { key: "profileSex", label: "Sex" },
  { key: "profileHeight", label: "Height (cm)" },
  { key: "profileCivilStatus", label: "Civil Status" },
  { key: "profileReligion", label: "Religion" },
  { key: "profileEmail", label: "Email" },
  { key: "profileContact", label: "Contact Number" },
  { key: "profileFacebook", label: "Facebook URL" },
  { key: "fatherName", label: "Father's Name" },
  { key: "motherMaidenName", label: "Mother's Maiden Name" },
  { key: "guardianName", label: "Guardian Name" },
  { key: "schoolName", label: "School Name" },
  { key: "gradeYear", label: "Grade/Year" },
  { key: "trackCourse", label: "Track/Course" },
  { key: "schoolYear", label: "School Year" },
  { key: "applicationYear", label: "Application Year" },
  { key: "motivation", label: "Motivation" },
]

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    if (value.length === 0) return "—"
    return value
      .map((item) => {
        if (typeof item === "string") return item
        if (typeof item === "number") return String(item)
        if (typeof item === "object" && item !== null && "value" in item) {
          return String((item as { value: unknown }).value)
        }
        return JSON.stringify(item)
      })
      .join(", ")
  }
  return String(value)
}

export default function SubmittedApplicationView({
  submission,
  snapshot,
}: SubmittedApplicationViewProps) {
  const documents = (snapshot.documents as Record<string, unknown> | undefined) ?? {}
  const uploadedDocs = Object.values(documents).filter(Boolean) as Array<{
    fileName?: string
    url?: string
  }>

  return (
    <div className="flex flex-col gap-6">
      <ApplicationStatusCard
        status={submission.status}
        submittedAt={submission.submittedAt}
        updatedAt={submission.updatedAt}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Application Data</CardTitle>
          <CardDescription>
            This is a read-only snapshot of the data you submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {DISPLAY_FIELDS.map((field) => (
            <div key={field.key}>
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p className="text-sm font-medium break-words">
                {renderValue(snapshot[field.key])}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            Files you attached to your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedDocs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileIcon />
                </EmptyMedia>
                <EmptyTitle>No uploaded documents</EmptyTitle>
                <EmptyDescription>No documents were attached to this submission.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {uploadedDocs.map((doc, index) => (
                <div key={`${doc.fileName}-${index}`} className="flex items-center justify-between rounded-md border p-2">
                  <p className="text-sm font-medium">{doc.fileName || "Uploaded file"}</p>
                  {doc.url && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
