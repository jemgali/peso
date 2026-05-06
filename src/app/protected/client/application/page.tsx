import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import ApplicationForm from "@/components/client/content/application-form";
import SubmittedApplicationView from "@/components/client/submitted-application-view";
import { PageHeader } from "@/components/shared";
import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/ui/button";
import {
  buildRevisionTargets,
} from "@/lib/utils/revision-targets";
import type { RevisionTargets } from "@/lib/validations/application-review";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

interface PageProps {
  searchParams?: Promise<{ mode?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isResubmitMode = resolvedSearchParams?.mode === "resubmit";
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const userEmail = session?.user?.email || "";
  const userId = session?.user?.id;
  const currentYear = new Date().getFullYear();

  // Fetch existing profile data (from onboarding or previous saves) to pre-populate the form
  let defaultValues: Record<string, unknown> | undefined;
  let revisionTargets: RevisionTargets | undefined;
  let latestSubmission:
      | {
        status: string;
        submittedAt: Date;
        updatedAt: Date;
        isGrantee: boolean;
        assignedOffice: string | null;
        applicationYear: number;
        applicantType: "new" | "spes-baby";
      }
    | undefined;

  if (userId) {
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
        include: { 
          personal: true,
          address: true,
          family: true,
          siblings: {
            orderBy: { siblingOrder: "asc" },
          },
          guardian: true,
          benefactor: true,
          education: true,
          spes: true,
          spesAvailments: {
            orderBy: { availmentOrder: "asc" },
          },
          skills: true,
          documents: true,
        },
      });

    if (profile) {
      // Build default values from existing profile data
      const personal = profile.personal;
      const address = profile.address;
      const family = profile.family;
      const guardian = profile.guardian;
      const benefactor = profile.benefactor;
      const education = profile.education;
      const spes = profile.spes;
      const siblings = profile.siblings;
      const spesAvailments = profile.spesAvailments;
      const skills = profile.skills;
      const documentsProfile = profile.documents;
      
      // Transform language dialect from string[] back to { value: string }[] // Assuming simple format here for Combobox or Multi-select
      const languageDialect = personal?.profileLanguageDialect
        ? (personal.profileLanguageDialect as Array<string | { value: string }>).map((lang) => 
            typeof lang === 'string' ? { value: lang } : lang
          )
        : [];

      defaultValues = {
        // From ProfileUser
        profileLastName: profile.profileLastName || "",
        profileFirstName: profile.profileFirstName || "",
        profileMiddleName: profile.profileMiddleName || "",
        profileSuffix: profile.profileSuffix || "",
        profileEmail: profile.profileEmail || userEmail,
        // From ProfilePersonal
        ...(personal && {
          profileBirthdate: personal.profileBirthdate
            ? new Date(personal.profileBirthdate).toISOString().split("T")[0]
            : "",
          profileAge: personal.profileAge ?? undefined,
          profilePlaceOfBirth: personal.profilePlaceOfBirth || "",
          profileSex: personal.profileSex || "",
          profileHeight: personal.profileHeight ?? undefined,
          profileCivilStatus: personal.profileCivilStatus || "",
          profileReligion: personal.profileReligion || "",
          profileLanguageDialect: languageDialect,
          profileContact: personal.profileContact || "",
          profileFacebook: personal.profileFacebook || "",
          profileDisability: personal.profileDisability || "",
          profilePwdId: personal.profilePwdId || "",
        }),
        // From ProfileAddress
        ...(address && {
          profileHouseStreet: address.profileHouseStreet || "",
          profileBarangay: address.profileBarangay || "",
          profileMunicipality: address.profileMunicipality || "",
          profileProvince: address.profileProvince || "",
        }),
        // From ProfileFamily
        ...(family && {
          fatherName: family.fatherName || "",
          fatherOccupation: family.fatherOccupation || "",
          fatherContact: family.fatherContact || "",
          motherMaidenName: family.motherMaidenName || "",
          motherOccupation: family.motherOccupation || "",
          motherContact: family.motherContact || "",
          numberOfSiblings: family.numberOfSiblings ?? undefined,
          siblings: siblings.map((sibling) => ({
            name: sibling.siblingName,
            age: sibling.siblingAge,
            occupation: sibling.siblingOccupation || "",
            sameHousehold: sibling.siblingSameHousehold,
          })),
        }),
        // From ProfileGuardian
        ...(guardian && {
          guardianName: guardian.guardianName || "",
          guardianContact: guardian.guardianContact || "",
          guardianAddress: guardian.guardianAddress || "",
          guardianAge: guardian.guardianAge ?? undefined,
          guardianOccupation: guardian.guardianOccupation || "",
          guardianRelationship: guardian.guardianRelationship || "",
        }),
        // From ProfileBenefactor
        ...(benefactor && {
          benefactorName: benefactor.benefactorName || "",
          benefactorRelationship: benefactor.benefactorRelationship || "",
        }),
        // From ProfileEducation
        ...(education && {
          gradeYear: education.gradeYear || "",
          schoolName: education.schoolName || "",
          trackCourse: education.trackCourse || "",
          schoolYear: education.schoolYear || "",
        }),
        // From ProfileSkills
        skills: skills?.skills
          ? (skills.skills as string[]).map((s) => ({ value: s }))
          : [],
        // From ProfileSPES
        ...(spes && {
          isFourPsBeneficiary: spes.isFourPsBeneficiary ?? false,
          applicationYear: spes.applicationYear ?? new Date().getFullYear(),
          spesBabiesAvailmentYears: spes.spesBabiesAvailmentYears ?? undefined,
          spesAvailments: spesAvailments.map((availment) => ({
            yearOfAvailment: availment.yearOfAvailment,
            assignedOffice: availment.assignedOffice,
          })),
          motivation: spes.motivation || "",
        }),
        // From ProfileDocuments
        ...(documentsProfile && {
          documents: documentsProfile.documents ?? {},
        }),
      };

      // Check latest submission
      const latest = await prisma.applicationSubmission.findFirst({
        where: { profileId: profile.profileId },
        orderBy: { submittedAt: "desc" },
        include: {
          spesWorkflow: {
            select: {
              selectionStatus: true,
              assignedOffice: true,
            },
          },
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            include: {
              fieldFeedback: true,
              documentFeedback: true,
            },
          },
        },
      });

      latestSubmission = latest
        ? {
            status: latest.status,
            submittedAt: latest.submittedAt,
            updatedAt: latest.updatedAt,
            isGrantee: latest.spesWorkflow?.selectionStatus === "GRANTEE",
            assignedOffice: latest.spesWorkflow?.assignedOffice || null,
            applicationYear:
              spes?.applicationYear ?? latest.submittedAt.getUTCFullYear(),
            applicantType: latest.applicantType === "SPES_BABY" ? "spes-baby" : "new",
          }
        : undefined;

      if (latest?.status === "needs_revision" && latest.reviews.length > 0) {
        const latestReview = latest.reviews[0];

        const normalizedFieldFeedback = latestReview.fieldFeedback
          .filter((fb) => fb.status === "valid" || fb.status === "invalid")
          .map((fb) => ({
            sectionId: fb.sectionId,
            fieldName: fb.fieldName,
            status: fb.status as "valid" | "invalid",
            comment: fb.comment ?? undefined,
          }));

        const normalizedDocumentFeedback = latestReview.documentFeedback
          .filter(
            (fb) =>
              fb.status === "valid" ||
              fb.status === "invalid" ||
              fb.status === "missing",
          )
          .map((fb) => ({
            documentType: fb.documentType,
            status: fb.status as "valid" | "invalid" | "missing",
            comment: fb.comment ?? undefined,
          }));

        revisionTargets = buildRevisionTargets({
          fieldFeedback: normalizedFieldFeedback,
          documentFeedback: normalizedDocumentFeedback,
        });
      }
    }
  }

  const isReturningGranteeSpesBaby = Boolean(
    latestSubmission?.isGrantee &&
      (latestSubmission.applicationYear || 0) < currentYear,
  );

  if (isReturningGranteeSpesBaby && defaultValues) {
    const existingAvailments = Array.isArray(defaultValues.spesAvailments)
      ? (defaultValues.spesAvailments as Array<{
          yearOfAvailment?: number;
          assignedOffice?: string;
        }>)
      : [];

    if (existingAvailments.length === 0) {
      const previousYear =
        latestSubmission?.applicationYear && latestSubmission.applicationYear > 0
          ? latestSubmission.applicationYear
          : currentYear - 1;
      defaultValues.spesAvailments = [
        {
          yearOfAvailment: previousYear,
          assignedOffice: latestSubmission?.assignedOffice || "",
        },
      ];
    }

    const availmentCount = Array.isArray(defaultValues.spesAvailments)
      ? defaultValues.spesAvailments.length
      : 1;
    defaultValues.spesBabiesAvailmentYears = availmentCount;
  }

  if (latestSubmission?.status === "approved") {
    const isCurrentCycleApproval =
      (latestSubmission.applicationYear || 0) >= currentYear;
    if (isCurrentCycleApproval) {
      if (latestSubmission.isGrantee) {
        redirect("/protected/client/application/documents");
      }
      redirect("/protected/client/application/status");
    }
  }

  // Check if user meets age requirement (14-31)
  const age = defaultValues?.profileAge as number | undefined;
  const isAgeIneligible = age !== undefined && (age < 14 || age > 31);

  if (isAgeIneligible) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Application Form"
          description="SPES application eligibility"
        />
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
            <XCircle className="size-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-destructive">
            You do not meet the age requirement to apply for SPES
          </h2>
          <p className="max-w-md text-base text-muted-foreground">
            We noticed that your registered age is <strong>{age} years old</strong>. 
            The Special Program for Employment of Students (SPES) is strictly open to applicants between <strong>14 and 31 years old</strong> only.
          </p>
          <div className="mt-8 rounded-lg bg-background p-4 shadow-sm border">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please update your birthdate in your profile settings.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/protected/profile">
                Go to Profile Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    latestSubmission &&
    (latestSubmission.status === "pending" || latestSubmission.status === "in_review")
  ) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Application Form"
          description="You already have an active SPES application. Here is your latest submitted data."
        />
        <SubmittedApplicationView
          submission={{
            status: latestSubmission.status as
              | "pending"
              | "in_review"
              | "approved"
              | "needs_revision"
              | "rejected",
            submittedAt: latestSubmission.submittedAt.toISOString(),
            updatedAt: latestSubmission.updatedAt.toISOString(),
          }}
          snapshot={defaultValues || {}}
        />
      </div>
    );
  }

  // Check if application period is open
  const now = new Date();
  let applicationPeriod = await prisma.spesApplicationPeriod.findUnique({
    where: { year: currentYear },
  });

  // Auto-close if close date has passed
  if (applicationPeriod?.isOpen && applicationPeriod.closeDate && new Date(applicationPeriod.closeDate) <= now) {
    applicationPeriod = await prisma.spesApplicationPeriod.update({
      where: { year: currentYear },
      data: { isOpen: false },
    });
  }

  const isRevisionStatus = latestSubmission?.status === "needs_revision";
  const isPeriodClosed = applicationPeriod ? !applicationPeriod.isOpen : true; // Default closed if no period record

  // Block new submissions if period is closed (revision users can still submit)
  if (isPeriodClosed && !isRevisionStatus) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Application Form"
          description="SPES application submission"
        />
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            Applications Are Over
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The SPES application period for {currentYear} is currently closed.
            Please check back when applications reopen or contact the PESO office for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Application Form"
        description={
          isResubmitMode && latestSubmission?.status === "needs_revision"
            ? "Review highlighted sections and resubmit your SPES application"
            : "Fill out and submit your SPES application"
        }
      />
      <ApplicationForm 
        userEmail={userEmail} 
        userId={userId}
        defaultValues={defaultValues} 
        revisionTargets={revisionTargets}
        initialApplicationType={
          isReturningGranteeSpesBaby
            ? "spes-baby"
            : latestSubmission?.status === "needs_revision"
            ? latestSubmission.applicantType
            : undefined
        }
      />
    </div>
  );
};

export default Page;
