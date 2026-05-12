import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { generateSpesApplicationPdf } from "@/lib/pdf-generation"

export async function GET(_req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get applicant profile
    const profile = await db.profileUser.findUnique({
      where: { userId: session.user.id },
      include: {
        personal: true,
        address: true,
        education: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Prepare data for PDF
    const pdfData = {
      lastName: profile.profileLastName || "",
      firstName: profile.profileFirstName || "",
      middleName: profile.profileMiddleName || "",
      suffix: profile.profileSuffix || "",
      birthdate: profile.personal?.profileBirthdate 
        ? new Date(profile.personal.profileBirthdate).toLocaleDateString() 
        : "",
      age: profile.personal?.profileAge || 0,
      sex: profile.personal?.profileSex || "",
      placeOfBirth: profile.personal?.profilePlaceOfBirth || "",
      address: profile.address 
        ? [
            profile.address.profileHouseStreet,
            profile.address.profileBarangay,
            profile.address.profileMunicipality,
            profile.address.profileProvince
          ].filter(Boolean).join(", ")
        : "",
      contactNumber: profile.personal?.profileContact || "",
      email: session.user.email || "",
      schoolName: profile.education?.schoolName || "",
      course: profile.education?.trackCourse || "",
      yearLevel: profile.education?.gradeYear || "",
    }

    const pdfBytes = await generateSpesApplicationPdf(pdfData)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SPES-Application-${profile.profileLastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[GENERATE_PDF_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
