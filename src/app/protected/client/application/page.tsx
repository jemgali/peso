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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const Page = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const userEmail = session?.user?.email || "";
  const userId = session?.user?.id;

  // Fetch existing profile data (from onboarding or previous saves) to pre-populate the form
  let defaultValues: Record<string, unknown> | undefined;
  let revisionFeedback: Record<string, string> | undefined;
  let latestSubmission:
      | {
        status: string;
        submittedAt: Date;
        updatedAt: Date;
        isGrantee: boolean;
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
          education: true,
          spes: true,
          spesAvailments: {
            orderBy: { availmentOrder: "asc" },
          },
        documents: true,
      },
    });

    if (profile) {
      // Build default values from existing profile data
      const personal = profile.personal;
      const address = profile.address;
      const family = profile.family;
      const guardian = profile.guardian;
      const education = profile.education;
      const spes = profile.spes;
      const siblings = profile.siblings;
      const spesAvailments = profile.spesAvailments;
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
        // From ProfileEducation
        ...(education && {
          gradeYear: education.gradeYear || "",
          schoolName: education.schoolName || "",
          trackCourse: education.trackCourse || "",
          schoolYear: education.schoolYear || "",
        }),
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
            },
          },
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            include: { fieldFeedback: true },
          },
        },
      });

      latestSubmission = latest
        ? {
            status: latest.status,
            submittedAt: latest.submittedAt,
            updatedAt: latest.updatedAt,
            isGrantee: latest.spesWorkflow?.selectionStatus === "GRANTEE",
            applicantType: latest.applicantType === "SPES_BABY" ? "spes-baby" : "new",
          }
        : undefined;

      if (latest?.status === "needs_revision" && latest.reviews.length > 0) {
        const latestReview = latest.reviews[0];
        const feedbackMap: Record<string, string> = {};
        
        latestReview.fieldFeedback.forEach(fb => {
          if (fb.status === "invalid" && fb.comment) {
            feedbackMap[fb.fieldName] = fb.comment;
          }
        });
        
        revisionFeedback = feedbackMap;
      }
    }
  }

  if (latestSubmission?.status === "approved") {
    if (latestSubmission.isGrantee) {
      redirect("/protected/client/application/documents");
    }

    redirect("/protected/client/application/status");
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Application Form"
        description="Fill out and submit your SPES application"
      />
      <ApplicationForm 
        userEmail={userEmail} 
        defaultValues={defaultValues} 
        revisionFeedback={revisionFeedback} 
        initialApplicationType={
          latestSubmission?.status === "needs_revision"
            ? latestSubmission.applicantType
            : undefined
        }
      />
    </div>
  );
};

export default Page;
