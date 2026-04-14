import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import ApplicationForm from "@/components/client/content/application-form";
import { PageHeader } from "@/components/shared";

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
  let revisionFeedback: Record<string, any> | undefined;

  if (userId) {
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
      include: { 
        personal: true,
        address: true,
        family: true,
        guardian: true,
        education: true,
        spes: true,
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
      
      // Transform language dialect from string[] back to { value: string }[] // Assuming simple format here for Combobox or Multi-select
      const languageDialect = personal?.profileLanguageDialect
        ? (personal.profileLanguageDialect as { value: string }[] | string[]).map((lang: any) => 
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
        profileRole: profile.profileRole || "",
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
          motivation: spes.motivation || "",
        }),
      };

      // Check for needs_revision submission
      const revisionSubmission = await prisma.applicationSubmission.findFirst({
        where: { profileId: profile.profileId, status: "needs_revision" },
        orderBy: { submittedAt: "desc" },
        include: {
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            include: { fieldFeedback: true },
          },
        },
      });

      if (revisionSubmission && revisionSubmission.reviews.length > 0) {
        const latestReview = revisionSubmission.reviews[0];
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
      />
    </div>
  );
};

export default Page;
