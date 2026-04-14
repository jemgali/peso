import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  profileSetupSchema,
  type ProfileSetupResponse,
} from "@/lib/validations/profile-setup";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProfileSetupResponse>> {
  try {
    // Get the current authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = profileSetupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Transform language arrays
    const languageDialects = data.profileLanguageDialect
      ? data.profileLanguageDialect.map((item) => item.value).filter(Boolean)
      : [];

    // Convert birthdate string to Date
    const birthdate = data.profileBirthdate
      ? new Date(data.profileBirthdate)
      : null;

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update or create ProfileUser with name fields + email
      let profile = await tx.profileUser.findUnique({
        where: { userId },
      });

      if (profile) {
        profile = await tx.profileUser.update({
          where: { userId },
          data: {
            profileLastName: data.profileLastName,
            profileFirstName: data.profileFirstName,
            profileMiddleName: data.profileMiddleName || null,
            profileSuffix: data.profileSuffix || null,
            profileEmail: data.profileEmail,
            profileRole: session.user.role || "client",
          },
        });
      } else {
        profile = await tx.profileUser.create({
          data: {
            profileId: randomUUID(),
            userId,
            profileLastName: data.profileLastName,
            profileFirstName: data.profileFirstName,
            profileMiddleName: data.profileMiddleName || null,
            profileSuffix: data.profileSuffix || null,
            profileEmail: data.profileEmail,
            profileRole: session.user.role || "client",
          },
        });
      }

      // Upsert ProfilePersonal with personal details
      const existingPersonal = await tx.profilePersonal.findUnique({
        where: { profileId: profile.profileId },
      });

      if (existingPersonal) {
        await tx.profilePersonal.update({
          where: { profileId: profile.profileId },
          data: {
            profileBirthdate: birthdate,
            profileAge: data.profileAge || null,
            profilePlaceOfBirth: data.profilePlaceOfBirth || null,
            profileSex: data.profileSex || null,
            profileHeight: data.profileHeight || null,
            profileCivilStatus: data.profileCivilStatus || null,
            profileReligion: data.profileReligion || null,
            profileLanguageDialect: languageDialects as string[],
            profileContact: data.profileContact || null,
            profileFacebook: data.profileFacebook || null,
            profileDisability: data.profileDisability || null,
            profilePwdId: data.profilePwdId || null,
          },
        });
      } else {
        await tx.profilePersonal.create({
          data: {
            personalId: randomUUID(),
            profileId: profile.profileId,
            profileBirthdate: birthdate,
            profileAge: data.profileAge || null,
            profilePlaceOfBirth: data.profilePlaceOfBirth || null,
            profileSex: data.profileSex || null,
            profileHeight: data.profileHeight || null,
            profileCivilStatus: data.profileCivilStatus || null,
            profileReligion: data.profileReligion || null,
            profileLanguageDialect: languageDialects as string[],
            profileContact: data.profileContact || null,
            profileFacebook: data.profileFacebook || null,
            profileDisability: data.profileDisability || null,
            profilePwdId: data.profilePwdId || null,
          },
        });
      }
    });

    return NextResponse.json(
      { success: true, message: "Profile setup completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving profile setup:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
