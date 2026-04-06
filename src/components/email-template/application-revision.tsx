import * as React from "react";

interface FieldFeedbackItem {
  fieldName: string;
  comment?: string;
}

interface DocumentFeedbackItem {
  documentType: string;
  status: string;
  comment?: string;
}

interface ApplicationRevisionEmailProps {
  applicantName: string;
  submissionNumber: number;
  overallComments?: string;
  fieldIssues?: FieldFeedbackItem[];
  documentIssues?: DocumentFeedbackItem[];
}

const FIELD_LABELS: Record<string, string> = {
  profileLastName: "Last Name",
  profileFirstName: "First Name",
  profileBirthdate: "Birthdate",
  profileAge: "Age",
  profilePlaceOfBirth: "Place of Birth",
  profileSex: "Sex",
  profileEmail: "Email",
  profileContact: "Contact",
};

const DOCUMENT_LABELS: Record<string, string> = {
  psaCertificate: "PSA Birth Certificate",
  schoolId: "School ID / Certificate of Enrollment",
  grades: "Report Card / Grades",
  barangayCertificate: "Barangay Certificate of Indigency",
  fourPsId: "4Ps ID",
  medicalCertificate: "Medical Certificate",
};

export function ApplicationRevisionEmail({
  applicantName,
  submissionNumber,
  overallComments,
  fieldIssues = [],
  documentIssues = [],
}: ApplicationRevisionEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#f97316",
          padding: "20px",
          textAlign: "center" as const,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ color: "white", margin: 0 }}>Application Needs Revision</h1>
      </div>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "30px",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <p style={{ fontSize: "16px", color: "#374151" }}>
          Dear <strong>{applicantName}</strong>,
        </p>

        <p style={{ fontSize: "16px", color: "#374151" }}>
          Thank you for your SPES application (Submission #{submissionNumber}). After
          review, we found some issues that need your attention before we can
          proceed.
        </p>

        {/* Overall Comments */}
        {overallComments && (
          <div
            style={{
              backgroundColor: "#fff7ed",
              border: "1px solid #f97316",
              borderRadius: "8px",
              padding: "20px",
              margin: "20px 0",
            }}
          >
            <h3 style={{ color: "#9a3412", margin: "0 0 10px 0" }}>
              Reviewer Comments:
            </h3>
            <p style={{ color: "#9a3412", margin: 0 }}>{overallComments}</p>
          </div>
        )}

        {/* Field Issues */}
        {fieldIssues.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ color: "#374151", margin: "0 0 10px 0" }}>
              Fields Requiring Correction:
            </h3>
            <ul style={{ color: "#374151", paddingLeft: "20px" }}>
              {fieldIssues.map((field, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <strong>
                    {FIELD_LABELS[field.fieldName] || field.fieldName}
                  </strong>
                  {field.comment && (
                    <span style={{ color: "#6b7280" }}> - {field.comment}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Document Issues */}
        {documentIssues.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ color: "#374151", margin: "0 0 10px 0" }}>
              Document Issues:
            </h3>
            <ul style={{ color: "#374151", paddingLeft: "20px" }}>
              {documentIssues.map((doc, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <strong>
                    {DOCUMENT_LABELS[doc.documentType] || doc.documentType}
                  </strong>
                  {" - "}
                  {doc.status === "missing" ? "Missing" : "Invalid"}
                  {doc.comment && (
                    <span style={{ color: "#6b7280" }}> ({doc.comment})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "20px",
            margin: "20px 0",
          }}
        >
          <h3 style={{ color: "#92400e", margin: "0 0 10px 0" }}>What to do:</h3>
          <ol style={{ color: "#92400e", margin: 0, paddingLeft: "20px" }}>
            <li>Log in to the PESO System</li>
            <li>Go to your Application Status page</li>
            <li>Click &quot;Edit & Resubmit&quot; to make corrections</li>
            <li>Submit your updated application</li>
          </ol>
        </div>

        <p style={{ fontSize: "16px", color: "#374151" }}>
          If you have any questions about the required changes, please contact the
          PESO office.
        </p>

        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "30px" }}>
          Best regards,
          <br />
          <strong>PESO Team</strong>
        </p>
      </div>

      <div
        style={{
          textAlign: "center" as const,
          padding: "20px",
          color: "#9ca3af",
          fontSize: "12px",
        }}
      >
        <p>
          This is an automated message from the PESO System.
          <br />
          Please do not reply directly to this email.
        </p>
      </div>
    </div>
  );
}
