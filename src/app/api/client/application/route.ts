import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import {
  spesApplicationSchema,
  type SPESApplicationResponse,
} from "@/lib/validations/spes-application";


import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest
): Promise<NextResponse<SPESApplicationResponse>> {
  let userId: string | undefined;
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

    userId = session.user.id;
    // We already checked if session.user exists, so userId is guaranteed to be a string here.
    const currentUserId = userId as string;

    // Check application period
    const currentYear = new Date().getFullYear();
    const applicationPeriod = await prisma.spesApplicationPeriod.findUnique({
      where: { year: currentYear },
    });

    // Auto-close check
    const now = new Date();
    const isPeriodOpen = applicationPeriod?.isOpen &&
      (!applicationPeriod.closeDate || new Date(applicationPeriod.closeDate) > now);

    if (!isPeriodOpen) {
      // Check if user has a needs_revision submission (exception to period closure)
      const revisionSubmission = await prisma.applicationSubmission.findFirst({
        where: {
          profile: { userId: currentUserId },
          status: "needs_revision",
        },
      });

      if (!revisionSubmission) {
        return NextResponse.json(
          {
            success: false,
            message: "Applications closed",
            error: `The SPES application period for ${currentYear} is currently closed.`,
          },
          { status: 403 }
        );
      }
    }

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
    const normalizedSpesAvailments = (data.spesAvailments || [])
      .map((availment, index) => ({
        yearOfAvailment: Number(availment.yearOfAvailment),
        assignedOffice: availment.assignedOffice.trim(),
        availmentOrder: index,
      }))
      .filter(
        (availment) =>
          Number.isFinite(availment.yearOfAvailment) &&
          availment.yearOfAvailment >= 1900 &&
          availment.assignedOffice.length > 0
      );

    const computedApplicantType =
      data.applicationType === "spes-baby"
        ? "SPES_BABY"
        : data.applicationType === "new"
        ? "NEW"
        : normalizedSpesAvailments.length > 0 ||
            (data.spesBabiesAvailmentYears && data.spesBabiesAvailmentYears > 0)
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
      const targetApplicationYear =
        data.applicationYear || new Date().getFullYear();
      const latestGranteeSubmission = await tx.applicationSubmission.findFirst({
        where: {
          profile: { userId: currentUserId },
          spesWorkflow: { selectionStatus: "GRANTEE" },
        },
        orderBy: {
          submittedAt: "desc",
        },
        select: {
          submittedAt: true,
        },
      });
      const forceSpesBabyApplicantType = Boolean(
        latestGranteeSubmission &&
          latestGranteeSubmission.submittedAt.getUTCFullYear() <
            targetApplicationYear,
      );
      const applicantType = forceSpesBabyApplicantType
        ? "SPES_BABY"
        : computedApplicantType;

      // Handle profile
      const profile = await tx.profileUser.upsert({
        where: { userId: currentUserId },
        update: {
          profileLastName: data.profileLastName,
          profileFirstName: data.profileFirstName,
          profileMiddleName: data.profileMiddleName || null,
          profileSuffix: data.profileSuffix || null,
          profileEmail: data.profileEmail || null,
        },
        create: {
          profileId: crypto.randomUUID(),
          userId: currentUserId,
          profileLastName: data.profileLastName,
          profileFirstName: data.profileFirstName,
          profileMiddleName: data.profileMiddleName || null,
          profileSuffix: data.profileSuffix || null,
          profileEmail: data.profileEmail || null,
        },
      });

      // Convert birthdate string to Date object if provided
      let birthdate = data.profileBirthdate
        ? new Date(data.profileBirthdate)
        : null;

      // Validate birthdate to prevent Prisma errors with "Invalid Date"
      if (birthdate && isNaN(birthdate.getTime())) {
        console.warn(`Invalid birthdate provided for user ${currentUserId}: ${data.profileBirthdate}`);
        birthdate = null;
      }

      // Handle personal details
      const personal = await tx.profilePersonal.upsert({
        where: { profileId: profile.profileId },
        update: {
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
        create: {
          personalId: crypto.randomUUID(),
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

      // Handle address
      const address = await tx.profileAddress.upsert({
        where: { profileId: profile.profileId },
        update: {
          profileHouseStreet: data.profileHouseStreet || null,
          profileBarangay: data.profileBarangay || null,
          profileMunicipality: data.profileMunicipality || null,
          profileProvince: data.profileProvince || null,
        },
        create: {
          addressId: crypto.randomUUID(),
          profileId: profile.profileId,
          profileHouseStreet: data.profileHouseStreet || null,
          profileBarangay: data.profileBarangay || null,
          profileMunicipality: data.profileMunicipality || null,
          profileProvince: data.profileProvince || null,
        },
      });

      // Handle family
      const family = await tx.profileFamily.upsert({
        where: { profileId: profile.profileId },
        update: {
          fatherName: data.fatherName || null,
          fatherOccupation: data.fatherOccupation || null,
          fatherContact: data.fatherContact || null,
          motherMaidenName: data.motherMaidenName || null,
          motherOccupation: data.motherOccupation || null,
          motherContact: data.motherContact || null,
          numberOfSiblings: data.numberOfSiblings || null,
          siblings: [],
        },
        create: {
          familyId: crypto.randomUUID(),
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

      // Handle siblings via dedicated ProfileSibling entity
      await tx.profileSibling.deleteMany({
        where: { profileId: profile.profileId },
      });

      const siblingsToPersist = (data.siblings || [])
        .filter((s) => s.name && s.age !== undefined && s.age !== null)
        .map((sibling, index) => ({
          siblingId: crypto.randomUUID(),
          profileId: profile.profileId,
          siblingName: sibling.name,
          siblingAge: Number(sibling.age),
          siblingOccupation: sibling.occupation || null,
          siblingSameHousehold: Boolean(sibling.sameHousehold),
          siblingOrder: index,
        }));

      if (siblingsToPersist.length > 0) {
        await tx.profileSibling.createMany({
          data: siblingsToPersist,
        });
      }

      // Handle guardian
      const guardian = await tx.profileGuardian.upsert({
        where: { profileId: profile.profileId },
        update: {
          guardianName: data.guardianName || null,
          guardianContact: data.guardianContact || null,
          guardianAddress: data.guardianAddress || null,
          guardianAge: data.guardianAge || null,
          guardianOccupation: data.guardianOccupation || null,
          guardianRelationship: data.guardianRelationship || null,
        },
        create: {
          guardianId: crypto.randomUUID(),
          profileId: profile.profileId,
          guardianName: data.guardianName || null,
          guardianContact: data.guardianContact || null,
          guardianAddress: data.guardianAddress || null,
          guardianAge: data.guardianAge || null,
          guardianOccupation: data.guardianOccupation || null,
          guardianRelationship: data.guardianRelationship || null,
        },
      });

      // Handle benefactor
      const benefactor = await tx.profileBenefactor.upsert({
        where: { profileId: profile.profileId },
        update: {
          benefactorName: data.benefactorName || null,
          benefactorRelationship: data.benefactorRelationship || null,
        },
        create: {
          benefactorId: crypto.randomUUID(),
          profileId: profile.profileId,
          benefactorName: data.benefactorName || null,
          benefactorRelationship: data.benefactorRelationship || null,
        },
      });

      // Handle education
      const education = await tx.profileEducation.upsert({
        where: { profileId: profile.profileId },
        update: {
          gradeYear: data.gradeYear || null,
          schoolName: data.schoolName || null,
          trackCourse: data.trackCourse || null,
          schoolYear: data.schoolYear || null,
        },
        create: {
          educationId: crypto.randomUUID(),
          profileId: profile.profileId,
          gradeYear: data.gradeYear || null,
          schoolName: data.schoolName || null,
          trackCourse: data.trackCourse || null,
          schoolYear: data.schoolYear || null,
        },
      });

      // Handle skills
      const skills = await tx.profileSkills.upsert({
        where: { profileId: profile.profileId },
        update: {
          skills: skillsList as string[],
        },
        create: {
          skillsId: crypto.randomUUID(),
          profileId: profile.profileId,
          skills: skillsList as string[],
        },
      });

      const spesBabiesAvailmentYears =
        applicantType === "SPES_BABY"
          ? normalizedSpesAvailments.length > 0
            ? normalizedSpesAvailments.length
            : data.spesBabiesAvailmentYears || null
          : null;

      // Handle SPES info
      const spes = await tx.profileSPES.upsert({
        where: { profileId: profile.profileId },
        update: {
          isFourPsBeneficiary: data.isFourPsBeneficiary || false,
          applicationYear: data.applicationYear || null,
          spesBabiesAvailmentYears,
          motivation: data.motivation || null,
        },
        create: {
          spesId: crypto.randomUUID(),
          profileId: profile.profileId,
          isFourPsBeneficiary: data.isFourPsBeneficiary || false,
          applicationYear: data.applicationYear || null,
          spesBabiesAvailmentYears,
          motivation: data.motivation || null,
        },
      });

      await tx.profileSPESAvailment.deleteMany({
        where: { profileId: profile.profileId },
      });

      if (applicantType === "SPES_BABY" && normalizedSpesAvailments.length > 0) {
        await tx.profileSPESAvailment.createMany({
          data: normalizedSpesAvailments.map((availment) => ({
            availmentId: crypto.randomUUID(),
            profileId: profile.profileId,
            yearOfAvailment: availment.yearOfAvailment,
            assignedOffice: availment.assignedOffice,
            availmentOrder: availment.availmentOrder,
          })),
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
          // Keep same submission record when applicant complies with revision.
          submission = await tx.applicationSubmission.update({
            where: { submissionId: submission.submissionId },
            data: {
              status: "pending",
              submittedAt: new Date(),
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
            submissionId: crypto.randomUUID(),
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
    }, {
      timeout: 30000,
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
    console.error(`Error submitting application for user ${userId}:`, error);
    if (error instanceof Error) {
      console.dir(error, { depth: null });
    }

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
