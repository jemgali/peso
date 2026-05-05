import type {
  DocumentFeedback,
  FieldFeedback,
  RevisionTargets,
} from "@/lib/validations/application-review";

export const FORM_SECTION_IDS = [
  "basic-info",
  "address",
  "family",
  "guardian",
  "benefactor",
  "education",
  "skills",
  "spes-info",
  "documents",
  "review",
] as const;

export type FormSectionId = (typeof FORM_SECTION_IDS)[number];

export const FORM_SECTION_TITLES: Record<FormSectionId, string> = {
  "basic-info": "Personal Information",
  address: "Address",
  family: "Family Information",
  guardian: "Guardian Details",
  benefactor: "Benefactor Information",
  education: "Educational Background",
  skills: "Skills",
  "spes-info": "SPES Program Details",
  documents: "Documents",
  review: "Review & Submit",
};

export const FORM_SECTION_FIELDS: Record<FormSectionId, string[]> = {
  "basic-info": [
    "profileLastName",
    "profileFirstName",
    "profileMiddleName",
    "profileSuffix",
    "profileBirthdate",
    "profileAge",
    "profilePlaceOfBirth",
    "profileSex",
    "profileHeight",
    "profileCivilStatus",
    "profileReligion",
    "profileEmail",
    "profileContact",
    "profileFacebook",
    "profileLanguageDialect",
    "profileDisability",
    "profilePwdId",
  ],
  address: [
    "profileHouseStreet",
    "profileBarangay",
    "profileMunicipality",
    "profileProvince",
  ],
  family: [
    "fatherName",
    "fatherOccupation",
    "fatherContact",
    "motherMaidenName",
    "motherOccupation",
    "motherContact",
    "numberOfSiblings",
    "siblings",
  ],
  guardian: [
    "guardianName",
    "guardianContact",
    "guardianAddress",
    "guardianAge",
    "guardianOccupation",
    "guardianRelationship",
  ],
  benefactor: ["benefactorName", "benefactorRelationship"],
  education: ["gradeYear", "schoolName", "trackCourse", "schoolYear"],
  skills: ["skills"],
  "spes-info": [
    "applicationType",
    "isFourPsBeneficiary",
    "applicationYear",
    "spesBabiesAvailmentYears",
    "spesAvailments",
    "motivation",
  ],
  documents: ["documents"],
  review: [],
};

const SECTION_ID_ALIASES: Record<string, FormSectionId> = {
  "basic-info": "basic-info",
  "personal-details": "basic-info",
  address: "address",
  family: "family",
  guardian: "guardian",
  benefactor: "benefactor",
  education: "education",
  skills: "skills",
  spes: "spes-info",
  "spes-info": "spes-info",
  documents: "documents",
};

function mapFieldToSectionId(
  fieldName: string,
  rawSectionId?: string,
): FormSectionId | null {
  for (const sectionId of FORM_SECTION_IDS) {
    if (FORM_SECTION_FIELDS[sectionId].includes(fieldName)) {
      return sectionId;
    }
  }

  if (!rawSectionId) return null;
  return SECTION_ID_ALIASES[rawSectionId] ?? null;
}

export function buildRevisionTargets({
  fieldFeedback,
  documentFeedback,
}: {
  fieldFeedback?: FieldFeedback[] | null;
  documentFeedback?: DocumentFeedback[] | null;
}): RevisionTargets | undefined {
  const invalidFieldFeedback = (fieldFeedback ?? []).filter(
    (feedback) => feedback.status === "invalid",
  );
  const invalidDocumentFeedback = (documentFeedback ?? []).filter(
    (feedback) => feedback.status !== "valid",
  );

  if (
    invalidFieldFeedback.length === 0 &&
    invalidDocumentFeedback.length === 0
  ) {
    return undefined;
  }

  const fieldsByKey = new Map<
    string,
    { sectionId: string; fieldName: string; comment?: string }
  >();

  for (const feedback of invalidFieldFeedback) {
    const mappedSectionId = mapFieldToSectionId(
      feedback.fieldName,
      feedback.sectionId,
    );

    if (!mappedSectionId) continue;

    const key = `${mappedSectionId}:${feedback.fieldName}`;
    if (!fieldsByKey.has(key)) {
      fieldsByKey.set(key, {
        sectionId: mappedSectionId,
        fieldName: feedback.fieldName,
        comment: feedback.comment,
      });
    }
  }

  const documentsByType = new Map<
    string,
    { documentType: string; status: "valid" | "invalid" | "missing"; comment?: string }
  >();
  for (const feedback of invalidDocumentFeedback) {
    if (!documentsByType.has(feedback.documentType)) {
      documentsByType.set(feedback.documentType, {
        documentType: feedback.documentType,
        status: feedback.status,
        comment: feedback.comment,
      });
    }
  }

  const sectionSet = new Set<FormSectionId>();
  for (const field of fieldsByKey.values()) {
    sectionSet.add(field.sectionId as FormSectionId);
  }
  if (documentsByType.size > 0) {
    sectionSet.add("documents");
  }

  const sections = FORM_SECTION_IDS.filter(
    (sectionId) => sectionId !== "review" && sectionSet.has(sectionId),
  );

  return {
    sections,
    fields: Array.from(fieldsByKey.values()),
    documents: Array.from(documentsByType.values()),
  };
}

export function getVisibleFormSections(
  revisionTargets?: RevisionTargets,
): FormSectionId[] {
  if (!revisionTargets || revisionTargets.sections.length === 0) {
    return [...FORM_SECTION_IDS];
  }

  const scoped = FORM_SECTION_IDS.filter(
    (sectionId) =>
      sectionId === "review" || revisionTargets.sections.includes(sectionId),
  );

  return scoped.length > 0 ? scoped : [...FORM_SECTION_IDS];
}
