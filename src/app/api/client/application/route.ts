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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const applicantType = data.spesBabiesAvailmentYears && data.spesBabiesAvailmentYears > 0
      ? "SPES_BABY"
      : "NEW";

    // Transform object arrays to string arrays for storage
    const languageDialects = data.profileLanguageDialect
      ? data.profileLanguageDialect.map((item) => item.value).filter(Boolean)
      : [];
    const skillsList = data.skills
      ? data.skills.map((item) => item.value).filter(Boolean)
      : [];

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
            profileLastName: data.profileLastName,
            profileFirstName: data.profileFirstName,
            profileMiddleName: data.profileMiddleName || null,
            profileSuffix: data.profileSuffix || null,
            profileEmail: data.profileEmail || null,
          },
        });
      } else {
        // Create new profile
        profile = await tx.profileUser.create({
          data: {
            profileId: randomUUID(),
            userId,
            profileLastName: data.profileLastName,
            profileFirstName: data.profileFirstName,
            profileMiddleName: data.profileMiddleName || null,
            profileSuffix: data.profileSuffix || null,
            profileEmail: data.profileEmail || null,
          },
        });
      }

      // Check if personal details already exist
      let personal = await tx.profilePersonal.findUnique({
        where: { profileId: profile.profileId },
      });

      // Convert birthdate string to Date object if provided
      const birthdate = data.profileBirthdate
        ? new Date(data.profileBirthdate)
        : null;

      if (personal) {
        // Update existing personal details
        personal = await tx.profilePersonal.update({
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
        // Create new personal details
        personal = await tx.profilePersonal.create({
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

      // Handle address
      let address = await tx.profileAddress.findUnique({
        where: { profileId: profile.profileId },
      });

      if (address) {
        address = await tx.profileAddress.update({
          where: { profileId: profile.profileId },
          data: {
            profileHouseStreet: data.profileHouseStreet || null,
            profileBarangay: data.profileBarangay || null,
            profileMunicipality: data.profileMunicipality || null,
            profileProvince: data.profileProvince || null,
          },
        });
      } else {
        address = await tx.profileAddress.create({
          data: {
            addressId: randomUUID(),
            profileId: profile.profileId,
            profileHouseStreet: data.profileHouseStreet || null,
            profileBarangay: data.profileBarangay || null,
            profileMunicipality: data.profileMunicipality || null,
            profileProvince: data.profileProvince || null,
          },
        });
      }

      // Handle family
      let family = await tx.profileFamily.findUnique({
        where: { profileId: profile.profileId },
      });

      if (family) {
        family = await tx.profileFamily.update({
          where: { profileId: profile.profileId },
          data: {
            fatherName: data.fatherName || null,
            fatherOccupation: data.fatherOccupation || null,
            fatherContact: data.fatherContact || null,
            motherMaidenName: data.motherMaidenName || null,
            motherOccupation: data.motherOccupation || null,
            motherContact: data.motherContact || null,
            numberOfSiblings: data.numberOfSiblings || null,
            siblings: [],
          },
        });
      } else {
        family = await tx.profileFamily.create({
          data: {
            familyId: randomUUID(),
            profileId: profile.profileId,
            fatherName: data.fatherName || null,
            fatherOccupation: data.fatherOccupation || null,
            fatherContact: data.fatherContact || null,
            motherMaidenName: data.motherMaidenName || null,
            motherOccupation: data.motherOccupation || null,
            motherContact: data.motherContact || null,
            numberOfSiblings: data.numberOfSiblings || null,
            siblings: [],
          },
        });
      }

      // Handle siblings via dedicated ProfileSibling entity
      await tx.profileSibling.deleteMany({
        where: { profileId: profile.profileId },
      });

      const siblingsToPersist = (data.siblings || [])
        .filter((s) => s.name && s.age !== undefined && s.age !== null)
        .map((sibling, index) => ({
          siblingId: randomUUID(),
          profileId: profile.profileId,
          siblingName: sibling.name,
          siblingAge: Number(sibling.age),
          siblingOccupation: sibling.occupation || null,
          siblingOrder: index,
        }));

      if (siblingsToPersist.length > 0) {
        await tx.profileSibling.createMany({
          data: siblingsToPersist,
        });
      }

      // Handle guardian
      let guardian = await tx.profileGuardian.findUnique({
        where: { profileId: profile.profileId },
      });

      if (guardian) {
        guardian = await tx.profileGuardian.update({
          where: { profileId: profile.profileId },
          data: {
            guardianName: data.guardianName || null,
            guardianContact: data.guardianContact || null,
            guardianAddress: data.guardianAddress || null,
            guardianAge: data.guardianAge || null,
            guardianOccupation: data.guardianOccupation || null,
            guardianRelationship: data.guardianRelationship || null,
          },
        });
      } else {
        guardian = await tx.profileGuardian.create({
          data: {
            guardianId: randomUUID(),
            profileId: profile.profileId,
            guardianName: data.guardianName || null,
            guardianContact: data.guardianContact || null,
            guardianAddress: data.guardianAddress || null,
            guardianAge: data.guardianAge || null,
            guardianOccupation: data.guardianOccupation || null,
            guardianRelationship: data.guardianRelationship || null,
          },
        });
      }

      // Handle benefactor
      let benefactor = await tx.profileBenefactor.findUnique({
        where: { profileId: profile.profileId },
      });

      if (benefactor) {
        benefactor = await tx.profileBenefactor.update({
          where: { profileId: profile.profileId },
          data: {
            benefactorName: data.benefactorName || null,
            benefactorRelationship: data.benefactorRelationship || null,
          },
        });
      } else {
        benefactor = await tx.profileBenefactor.create({
          data: {
            benefactorId: randomUUID(),
            profileId: profile.profileId,
            benefactorName: data.benefactorName || null,
            benefactorRelationship: data.benefactorRelationship || null,
          },
        });
      }

      // Handle education
      let education = await tx.profileEducation.findUnique({
        where: { profileId: profile.profileId },
      });

      if (education) {
        education = await tx.profileEducation.update({
          where: { profileId: profile.profileId },
          data: {
            gradeYear: data.gradeYear || null,
            schoolName: data.schoolName || null,
            trackCourse: data.trackCourse || null,
            schoolYear: data.schoolYear || null,
          },
        });
      } else {
        education = await tx.profileEducation.create({
          data: {
            educationId: randomUUID(),
            profileId: profile.profileId,
            gradeYear: data.gradeYear || null,
            schoolName: data.schoolName || null,
            trackCourse: data.trackCourse || null,
            schoolYear: data.schoolYear || null,
          },
        });
      }

      // Handle skills
      let skills = await tx.profileSkills.findUnique({
        where: { profileId: profile.profileId },
      });

      if (skills) {
        skills = await tx.profileSkills.update({
          where: { profileId: profile.profileId },
          data: {
            skills: skillsList as string[],
          },
        });
      } else {
        skills = await tx.profileSkills.create({
          data: {
            skillsId: randomUUID(),
            profileId: profile.profileId,
            skills: skillsList as string[],
          },
        });
      }

      // Handle SPES info
      let spes = await tx.profileSPES.findUnique({
        where: { profileId: profile.profileId },
      });

      if (spes) {
        spes = await tx.profileSPES.update({
          where: { profileId: profile.profileId },
          data: {
            isFourPsBeneficiary: data.isFourPsBeneficiary || false,
            applicationYear: data.applicationYear || null,
            spesBabiesAvailmentYears: data.spesBabiesAvailmentYears || null,
            motivation: data.motivation || null,
          },
        });
      } else {
        spes = await tx.profileSPES.create({
          data: {
            spesId: randomUUID(),
            profileId: profile.profileId,
            isFourPsBeneficiary: data.isFourPsBeneficiary || false,
            applicationYear: data.applicationYear || null,
            spesBabiesAvailmentYears: data.spesBabiesAvailmentYears || null,
            motivation: data.motivation || null,
          },
        });
      }

      // Handle ApplicationSubmission - create new or handle resubmission
      let submission = await tx.applicationSubmission.findFirst({
        where: { profileId: profile.profileId },
        orderBy: { submittedAt: "desc" },
      });

      if (submission) {
        // Check if resubmission is allowed (only if status is needs_revision)
        if (submission.status === "needs_revision") {
          // Create new submission for resubmission
          submission = await tx.applicationSubmission.create({
            data: {
              submissionId: randomUUID(),
              profileId: profile.profileId,
              status: "pending",
              applicantType,
            },
          });
        } else if (submission.status === "pending" || submission.status === "in_review") {
          // Update existing pending submission
          submission = await tx.applicationSubmission.update({
            where: { submissionId: submission.submissionId },
            data: {
              submittedAt: new Date(),
              applicantType,
            },
          });
        } else {
          // If approved or rejected, don't allow new submission (or create new one based on business logic)
          // For now, we'll just return the existing submission
        }
      } else {
        // First-time submission
        submission = await tx.applicationSubmission.create({
          data: {
            submissionId: randomUUID(),
            profileId: profile.profileId,
            status: "pending",
            applicantType,
          },
        });
      }

      return {
        profile,
        personal,
        address,
        family,
        guardian,
        benefactor,
        education,
        skills,
        spes,
        submission,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data: {
          profileId: result.profile.profileId,
          personalId: result.personal.personalId,
          addressId: result.address.addressId,
          familyId: result.family.familyId,
          guardianId: result.guardian.guardianId,
          benefactorId: result.benefactor.benefactorId,
          educationId: result.education.educationId,
          skillsId: result.skills.skillsId,
          spesId: result.spes.spesId,
          submissionId: result.submission?.submissionId,
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
