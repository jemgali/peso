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

  // Fetch existing profile data (from onboarding) to pre-populate the form
  let defaultValues: Record<string, unknown> | undefined;

  if (userId) {
    const profile = await prisma.profileUser.findUnique({
      where: { userId },
      include: { personal: true },
    });

    if (profile) {
      // Build default values from existing profile + personal data
      const personal = profile.personal;
      
      // Transform language dialect from string[] back to { value: string }[]
      const languageDialect = personal?.profileLanguageDialect
        ? (personal.profileLanguageDialect as string[]).map((lang: string) => ({ value: lang }))
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
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Application Form"
        description="Fill out and submit your SPES application"
      />
      <ApplicationForm userEmail={userEmail} defaultValues={defaultValues} />
    </div>
  );
};

export default Page;
