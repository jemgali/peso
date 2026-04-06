"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import type { ApplicationDetailResponse } from "@/lib/validations/application-review";

interface ApplicationViewerProps {
  data: NonNullable<ApplicationDetailResponse["data"]>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Card className="p-4">
    <h3 className="font-semibold mb-3 text-lg">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </Card>
);

interface FieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

const Field: React.FC<FieldProps> = ({ label, value }) => {
  let displayValue: string;
  
  if (value === null || value === undefined || value === "") {
    displayValue = "—";
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else {
    displayValue = String(value);
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{displayValue}</p>
    </div>
  );
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
};

const ApplicationViewer: React.FC<ApplicationViewerProps> = ({ data }) => {
  const { profile, personal, address, family, guardian, benefactor, education, skills, spes } = data;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Section title="Basic Information">
        <Field label="Last Name" value={profile.profileLastName} />
        <Field label="First Name" value={profile.profileFirstName} />
        <Field label="Middle Name" value={profile.profileMiddleName} />
        <Field label="Suffix" value={profile.profileSuffix} />
        <Field label="Role" value={profile.profileRole} />
      </Section>

      {/* Personal Details */}
      {personal && (
        <Section title="Personal Details">
          <Field 
            label="Birthdate" 
            value={formatDate(personal.profileBirthdate as string | null)} 
          />
          <Field label="Age" value={personal.profileAge as number | null} />
          <Field label="Place of Birth" value={personal.profilePlaceOfBirth as string | null} />
          <Field label="Sex" value={personal.profileSex as string | null} />
          <Field label="Height (cm)" value={personal.profileHeight as number | null} />
          <Field label="Civil Status" value={personal.profileCivilStatus as string | null} />
          <Field label="Religion" value={personal.profileReligion as string | null} />
          <Field label="Email" value={personal.profileEmail as string | null} />
          <Field label="Contact" value={personal.profileContact as string | null} />
          <Field label="Facebook" value={personal.profileFacebook as string | null} />
          <Field label="Disability" value={personal.profileDisability as string | null} />
          <Field label="PWD ID" value={personal.profilePwdId as string | null} />
        </Section>
      )}

      {/* Address */}
      {address && (
        <Section title="Address">
          <Field label="House/Street" value={address.profileHouseStreet as string | null} />
          <Field label="Barangay" value={address.profileBarangay as string | null} />
          <Field label="Municipality" value={address.profileMunicipality as string | null} />
          <Field label="Province" value={address.profileProvince as string | null} />
        </Section>
      )}

      {/* Family Information */}
      {family && (
        <Section title="Family Information">
          <Field label="Father's Name" value={family.fatherName as string | null} />
          <Field label="Father's Occupation" value={family.fatherOccupation as string | null} />
          <Field label="Father's Contact" value={family.fatherContact as string | null} />
          <Field label="Mother's Maiden Name" value={family.motherMaidenName as string | null} />
          <Field label="Mother's Occupation" value={family.motherOccupation as string | null} />
          <Field label="Mother's Contact" value={family.motherContact as string | null} />
          <Field label="Number of Siblings" value={family.numberOfSiblings as number | null} />
        </Section>
      )}

      {/* Guardian Information */}
      {guardian && (
        <Section title="Guardian Information">
          <Field label="Guardian Name" value={guardian.guardianName as string | null} />
          <Field label="Guardian Contact" value={guardian.guardianContact as string | null} />
          <Field label="Guardian Address" value={guardian.guardianAddress as string | null} />
          <Field label="Guardian Age" value={guardian.guardianAge as number | null} />
          <Field label="Guardian Occupation" value={guardian.guardianOccupation as string | null} />
          <Field label="Relationship" value={guardian.guardianRelationship as string | null} />
        </Section>
      )}

      {/* Benefactor Information */}
      {benefactor && (
        <Section title="Benefactor Information">
          <Field label="Benefactor Name" value={benefactor.benefactorName as string | null} />
          <Field label="Relationship" value={benefactor.benefactorRelationship as string | null} />
        </Section>
      )}

      {/* Education */}
      {education && (
        <Section title="Education">
          <Field label="Grade/Year Level" value={education.gradeYear as string | null} />
          <Field label="School Name" value={education.schoolName as string | null} />
          <Field label="Track/Course" value={education.trackCourse as string | null} />
          <Field label="School Year" value={education.schoolYear as string | null} />
        </Section>
      )}

      {/* Skills */}
      {skills && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-lg">Skills</h3>
          {Array.isArray(skills.skills) && skills.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(skills.skills as string[]).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills listed</p>
          )}
        </Card>
      )}

      {/* SPES Information */}
      {spes && (
        <Section title="SPES Information">
          <Field label="4Ps Beneficiary" value={spes.isFourPsBeneficiary as boolean | null} />
          <Field label="Application Year" value={spes.applicationYear as number | null} />
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Motivation</p>
            <p className="font-medium whitespace-pre-wrap">
              {(spes.motivation as string | null) || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Remarks</p>
            <p className="font-medium whitespace-pre-wrap">
              {(spes.remarks as string | null) || "—"}
            </p>
          </div>
        </Section>
      )}
    </div>
  );
};

export default ApplicationViewer;
