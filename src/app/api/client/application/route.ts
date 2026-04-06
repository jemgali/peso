import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  spesApplicationSchema,
  type SPESApplicationResponse,
} from "@/lib/validations/spes-application";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export async function POST(
  request: NextRequest
): Promise<NextResponse<SPESApplicationResponse>> {
  try {
    // Get the current authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "You must be logged in to submit an application",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = spesApplicationSchema.safeParse(body);

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

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if profile already exists for this user
      let profile = await tx.profileUser.findUnique({
        where: { userId },
      });

      if (profile) {
        // Update existing profile
        profile = await tx.profileUser.update({
          where: { userId },
          data: {
            profileLastName: data.lastName,
            profileFirstName: data.firstName,
            profileMiddleName: data.middleName || null,
            profileSuffix: data.suffix || null,
            profileRole: data.profileRole,
          },
        });
      } else {
        // Create new profile
        profile = await tx.profileUser.create({
          data: {
            profileId: randomUUID(),
            userId,
            profileLastName: data.lastName,
            profileFirstName: data.firstName,
            profileMiddleName: data.middleName || null,
            profileSuffix: data.suffix || null,
            profileRole: data.profileRole,
          },
        });
      }

      // Check if personal details already exist
      let personal = await tx.profilePersonal.findUnique({
        where: { profileId: profile.profileId },
      });

      // Convert birthdate string to Date object if provided
      const birthdate = data.birthdate
        ? new Date(data.birthdate)
        : null;

      if (personal) {
        // Update existing personal details
        personal = await tx.profilePersonal.update({
          where: { profileId: profile.profileId },
          data: {
            profileBirthdate: birthdate,
            profileAge: data.age || null,
            profilePlaceOfBirth: data.placeOfBirth || null,
            profileSex: data.sex || null,
            profileHeight: data.height || null,
            profileCivilStatus: data.civilStatus || null,
            profileLanguageDialect: data.languageDialect || "",
            profileContact: data.contact || null,
            profileFacebook: data.facebook || null,
          },
        });
      } else {
        // Create new personal details
        personal = await tx.profilePersonal.create({
          data: {
            personalId: randomUUID(),
            profileId: profile.profileId,
            profileBirthdate: birthdate,
            profileAge: data.age || null,
            profilePlaceOfBirth: data.placeOfBirth || null,
            profileSex: data.sex || null,
            profileHeight: data.height || null,
            profileCivilStatus: data.civilStatus || null,
            profileLanguageDialect: data.languageDialect || "",
            profileContact: data.contact || null,
            profileFacebook: data.facebook || null,
          },
        });
      }

      return { profile, personal };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data: {
          profileId: result.profile.profileId,
          personalId: result.personal.personalId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
