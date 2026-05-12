import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/validations/application-review"
import {
  DEFAULT_APPLICANT_CATEGORY_COUNTS,
  DEFAULT_APPLICATION_STATUS_COUNTS,
  DEFAULT_WORKFLOW_EXAM_RESULT_COUNTS,
  DEFAULT_WORKFLOW_SELECTION_COUNTS,
  DEFAULT_WORKFLOW_STAGE_COUNTS,
  REPORT_MONTH_LABELS,
  type MetricCount,
  type RecentApplicationItem,
  SPES_REPORT_MAX_YEAR,
  SPES_REPORT_MIN_YEAR,
  type SpesReportsData,
  type TopGranteeScoreItem,
  type TraitAverageItem,
} from "@/lib/validations/spes-reports"
import { prisma } from "@/lib/prisma"
import {
  toApiApplicantCategory,
  toApiExamResult,
  toApiSelectionStatus,
  toApiStage,
} from "@/lib/utils/spes-workflow"

const TRAIT_DEFINITIONS: Array<{ key: TraitAverageItem["trait"]; label: string }> = [
  { key: "punctuality", label: "Punctuality" },
  { key: "respect", label: "Respect" },
  { key: "honesty", label: "Honesty" },
  { key: "adaptability", label: "Adaptability" },
  { key: "expression", label: "Expression" },
  { key: "initiative", label: "Initiative" },
  { key: "following", label: "Following Instructions" },
  { key: "efficiency", label: "Efficiency" },
  { key: "creativity", label: "Creativity" },
]

function formatApplicantName(fields: {
  firstName: string | null
  middleName: string | null
  lastName: string | null
  suffix: string | null
}): string {
  return (
    [fields.firstName, fields.middleName, fields.lastName, fields.suffix]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ") || "Unnamed applicant"
  )
}

function toCountMap<TLabel extends string>(
  items: MetricCount<TLabel>[]
): Map<TLabel, number> {
  return new Map(items.map((item) => [item.label, item.count]))
}

function toSortedCountArray(counts: Map<string, number>): MetricCount<string>[] {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100
}

function toApplicationStatus(value: string): ApplicationStatus | null {
  const normalized = value.toLowerCase()
  if (!APPLICATION_STATUSES.includes(normalized as ApplicationStatus)) {
    return null
  }
  return normalized as ApplicationStatus
}

function getYearWindow(selectedYear: number): { gte: Date; lt: Date } {
  return {
    gte: new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0)),
    lt: new Date(Date.UTC(selectedYear + 1, 0, 1, 0, 0, 0)),
  }
}

export async function getSpesReportsData(year?: number): Promise<SpesReportsData> {
  const currentYear = new Date().getUTCFullYear()
  const selectedYear = year ?? currentYear
  if (
    !Number.isInteger(selectedYear) ||
    selectedYear < SPES_REPORT_MIN_YEAR ||
    selectedYear > SPES_REPORT_MAX_YEAR
  ) {
    throw new Error(
      `Invalid report year: ${selectedYear}. Expected ${SPES_REPORT_MIN_YEAR}-${SPES_REPORT_MAX_YEAR}.`
    )
  }
  const yearWindow = getYearWindow(selectedYear)

  const [submissionDates, submissions, workflows, granteeRecords] = await Promise.all([
    prisma.applicationSubmission.findMany({
      select: { submittedAt: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.applicationSubmission.findMany({
      where: { submittedAt: yearWindow },
      select: {
        submissionId: true,
        status: true,
        applicantType: true,
        submittedAt: true,
        profile: {
          select: {
            profileFirstName: true,
            profileMiddleName: true,
            profileLastName: true,
            profileSuffix: true,
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.spesWorkflow.findMany({
      where: {
        submission: { submittedAt: yearWindow },
      },
      select: {
        workflowId: true,
        selectionStatus: true,
        stage: true,
        examResult: true,
        assignedOffice: true,
        batchId: true,
        batch: {
          select: {
            batchName: true,
            batchYear: true,
          },
        },
      },
    }),
    prisma.spesGranteeRecord.findMany({
      where: {
        workflow: {
          selectionStatus: "GRANTEE",
          submission: {
            submittedAt: yearWindow,
          },
        },
      },
      select: {
        recordId: true,
        workflowId: true,
        punctuality: true,
        respect: true,
        honesty: true,
        adaptability: true,
        expression: true,
        initiative: true,
        following: true,
        efficiency: true,
        creativity: true,
        ratedBy: true,
        createdAt: true,
        workflow: {
          select: {
            assignedOffice: true,
            batch: {
              select: {
                batchName: true,
              },
            },
            submission: {
              select: {
                profile: {
                  select: {
                    profileFirstName: true,
                    profileMiddleName: true,
                    profileLastName: true,
                    profileSuffix: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const availableYears = Array.from(new Set(submissionDates.map((entry) => entry.submittedAt.getUTCFullYear())))
    .filter((entryYear) => entryYear >= SPES_REPORT_MIN_YEAR && entryYear <= SPES_REPORT_MAX_YEAR)
  if (availableYears.length === 0) {
    availableYears.push(currentYear)
  }
  if (!availableYears.includes(selectedYear)) {
    availableYears.push(selectedYear)
  }
  availableYears.sort((a, b) => b - a)

  const monthlyApplicationTrend = REPORT_MONTH_LABELS.map((month) => ({
    month,
    total: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
  }))

  const applicationStatusCounts = DEFAULT_APPLICATION_STATUS_COUNTS.map((item) => ({ ...item }))
  const applicantCategoryCounts = DEFAULT_APPLICANT_CATEGORY_COUNTS.map((item) => ({ ...item }))
  const workflowSelectionStatusCounts = DEFAULT_WORKFLOW_SELECTION_COUNTS.map((item) => ({ ...item }))
  const workflowStageCounts = DEFAULT_WORKFLOW_STAGE_COUNTS.map((item) => ({ ...item }))
  const workflowExamResultCounts = DEFAULT_WORKFLOW_EXAM_RESULT_COUNTS.map((item) => ({ ...item }))

  const appStatusCountMap = toCountMap(applicationStatusCounts)
  const applicantCategoryCountMap = toCountMap(applicantCategoryCounts)
  const workflowSelectionCountMap = toCountMap(workflowSelectionStatusCounts)
  const workflowStageCountMap = toCountMap(workflowStageCounts)
  const workflowExamResultCountMap = toCountMap(workflowExamResultCounts)

  for (const submission of submissions) {
    const monthIndex = submission.submittedAt.getUTCMonth()
    const bucket = monthlyApplicationTrend[monthIndex]
    bucket.total += 1

    const status = toApplicationStatus(submission.status)
    if (status) {
      appStatusCountMap.set(status, (appStatusCountMap.get(status) ?? 0) + 1)
      if (status === "approved") bucket.approved += 1
      if (status === "rejected") bucket.rejected += 1
      if (status === "needs_revision") bucket.needsRevision += 1
    }

    const applicantCategory = toApiApplicantCategory(submission.applicantType)
    applicantCategoryCountMap.set(
      applicantCategory,
      (applicantCategoryCountMap.get(applicantCategory) ?? 0) + 1
    )
  }

  const officeAssignmentMap = new Map<string, number>()
  const batchAssignmentMap = new Map<string, number>()
  const assignedBatchIds = new Set<string>()

  for (const workflow of workflows) {
    const selectionStatus = toApiSelectionStatus(workflow.selectionStatus)
    const stage = toApiStage(workflow.stage)
    const examResult = toApiExamResult(workflow.examResult)

    workflowSelectionCountMap.set(
      selectionStatus,
      (workflowSelectionCountMap.get(selectionStatus) ?? 0) + 1
    )
    workflowStageCountMap.set(stage, (workflowStageCountMap.get(stage) ?? 0) + 1)
    workflowExamResultCountMap.set(
      examResult,
      (workflowExamResultCountMap.get(examResult) ?? 0) + 1
    )

    const assignedOffice = workflow.assignedOffice?.trim()
    if (assignedOffice) {
      officeAssignmentMap.set(
        assignedOffice,
        (officeAssignmentMap.get(assignedOffice) ?? 0) + 1
      )
    }

    const batchName = workflow.batch?.batchName?.trim()
    if (workflow.batchId && workflow.batch && batchName) {
      assignedBatchIds.add(workflow.batchId)
      const batchLabel = `${batchName} (${workflow.batch.batchYear})`
      batchAssignmentMap.set(batchLabel, (batchAssignmentMap.get(batchLabel) ?? 0) + 1)
    } else {
      batchAssignmentMap.set("Unassigned", (batchAssignmentMap.get("Unassigned") ?? 0) + 1)
    }
  }

  const traitTotals = {
    punctuality: 0,
    respect: 0,
    honesty: 0,
    adaptability: 0,
    expression: 0,
    initiative: 0,
    following: 0,
    efficiency: 0,
    creativity: 0,
  }
  let traitRecordCount = 0

  const latestRecordByWorkflow = new Map<string, TopGranteeScoreItem>()

  for (const record of granteeRecords) {
    traitTotals.punctuality += record.punctuality
    traitTotals.respect += record.respect
    traitTotals.honesty += record.honesty
    traitTotals.adaptability += record.adaptability
    traitTotals.expression += record.expression
    traitTotals.initiative += record.initiative
    traitTotals.following += record.following
    traitTotals.efficiency += record.efficiency
    traitTotals.creativity += record.creativity
    traitRecordCount += 1

    if (!latestRecordByWorkflow.has(record.workflowId)) {
      const scoreSum =
        record.punctuality +
        record.respect +
        record.honesty +
        record.adaptability +
        record.expression +
        record.initiative +
        record.following +
        record.efficiency +
        record.creativity

      latestRecordByWorkflow.set(record.workflowId, {
        recordId: record.recordId,
        workflowId: record.workflowId,
        applicantName: formatApplicantName({
          firstName: record.workflow.submission.profile.profileFirstName,
          middleName: record.workflow.submission.profile.profileMiddleName,
          lastName: record.workflow.submission.profile.profileLastName,
          suffix: record.workflow.submission.profile.profileSuffix,
        }),
        averageScore: roundToTwo(scoreSum / TRAIT_DEFINITIONS.length),
        assignedOffice: record.workflow.assignedOffice,
        batchName: record.workflow.batch?.batchName || null,
        ratedBy: record.ratedBy,
        createdAt: record.createdAt.toISOString(),
      })
    }
  }

  const averageTraitScores: TraitAverageItem[] = TRAIT_DEFINITIONS.map(({ key, label }) => ({
    trait: key,
    label,
    average: traitRecordCount === 0 ? 0 : roundToTwo(traitTotals[key] / traitRecordCount),
  }))

  const totalGranteeScore = Object.values(traitTotals).reduce((sum, value) => sum + value, 0)
  const averageGranteeScore =
    traitRecordCount === 0
      ? null
      : roundToTwo(totalGranteeScore / (traitRecordCount * TRAIT_DEFINITIONS.length))

  const topGranteeScores = Array.from(latestRecordByWorkflow.values())
    .sort((a, b) => {
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore
      return b.createdAt.localeCompare(a.createdAt)
    })
    .slice(0, 10)

  const recentApplications: RecentApplicationItem[] = [...submissions]
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 10)
    .flatMap((submission) => {
      const status = toApplicationStatus(submission.status)
      if (!status) return []

      return [
        {
          submissionId: submission.submissionId,
          applicantName: formatApplicantName({
            firstName: submission.profile.profileFirstName,
            middleName: submission.profile.profileMiddleName,
            lastName: submission.profile.profileLastName,
            suffix: submission.profile.profileSuffix,
          }),
          applicantType: toApiApplicantCategory(submission.applicantType),
          status,
          submittedAt: submission.submittedAt.toISOString(),
        },
      ]
    })

  const applicationStatusCountList = applicationStatusCounts.map((item) => ({
    label: item.label,
    count: appStatusCountMap.get(item.label) ?? 0,
  }))
  const applicantCategoryCountList = applicantCategoryCounts.map((item) => ({
    label: item.label,
    count: applicantCategoryCountMap.get(item.label) ?? 0,
  }))
  const workflowSelectionCountList = workflowSelectionStatusCounts.map((item) => ({
    label: item.label,
    count: workflowSelectionCountMap.get(item.label) ?? 0,
  }))
  const workflowStageCountList = workflowStageCounts.map((item) => ({
    label: item.label,
    count: workflowStageCountMap.get(item.label) ?? 0,
  }))
  const workflowExamResultCountList = workflowExamResultCounts.map((item) => ({
    label: item.label,
    count: workflowExamResultCountMap.get(item.label) ?? 0,
  }))

  const officeAssignmentCounts = toSortedCountArray(officeAssignmentMap)
  const batchAssignmentCounts = toSortedCountArray(batchAssignmentMap)

  const activeBatchCount = assignedBatchIds.size

  return {
    selectedYear,
    availableYears,
    generatedAt: new Date().toISOString(),
    summary: {
      totalApplications: submissions.length,
      pendingApplications: appStatusCountMap.get("pending") ?? 0,
      approvedApplications: appStatusCountMap.get("approved") ?? 0,
      needsRevisionApplications: appStatusCountMap.get("needs_revision") ?? 0,
      rejectedApplications: appStatusCountMap.get("rejected") ?? 0,
      totalWorkflows: workflows.length,
      granteeCount: workflowSelectionCountMap.get("grantee") ?? 0,
      waitlistedCount: workflowSelectionCountMap.get("waitlisted") ?? 0,
      deniedCount: workflowSelectionCountMap.get("denied") ?? 0,
      assignedOfficeCount: officeAssignmentCounts.length,
      activeBatchCount,
      averageGranteeScore,
    },
    monthlyApplicationTrend,
    applicationStatusCounts: applicationStatusCountList,
    applicantCategoryCounts: applicantCategoryCountList,
    workflowSelectionStatusCounts: workflowSelectionCountList,
    workflowStageCounts: workflowStageCountList,
    workflowExamResultCounts: workflowExamResultCountList,
    officeAssignmentCounts,
    batchAssignmentCounts,
    averageTraitScores,
    recentApplications,
    topGranteeScores,
  }
}
