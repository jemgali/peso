import * as React from "react";

interface ApplicationApprovedEmailProps {
  applicantName: string;
}

export function ApplicationApprovedEmail({
  applicantName,
}: ApplicationApprovedEmailProps) {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header with PESO branding */}
      <div
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          padding: "32px 24px",
          textAlign: "center" as const,
          borderRadius: "12px 12px 0 0",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
        <h1 style={{ 
          color: "white", 
          margin: "0 0 8px 0",
          fontSize: "28px",
          fontWeight: "700",
        }}>
          Application Approved!
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.9)", margin: 0, fontSize: "14px" }}>
          PESO - Public Employment Service Office
        </p>
      </div>

      {/* Main content */}
      <div
        style={{
          padding: "32px 24px",
          backgroundColor: "#ffffff",
        }}
      >
        <p style={{ fontSize: "16px", color: "#1f2937", lineHeight: "1.6" }}>
          Dear <strong>{applicantName}</strong>,
        </p>

        <p style={{ fontSize: "16px", color: "#1f2937", lineHeight: "1.6" }}>
          Congratulations! We are pleased to inform you that your SPES application
          has been approved.
        </p>

        {/* Success box */}
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "2px solid #10b981",
            borderRadius: "12px",
            padding: "24px",
            margin: "24px 0",
          }}
        >
          <h3 style={{ 
            color: "#065f46", 
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
          }}>
            ✅ What&apos;s Next?
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#065f46", verticalAlign: "top", width: "24px" }}>1.</td>
                <td style={{ padding: "8px 0", color: "#065f46" }}>
                  <strong>Visit the PESO office</strong> during office hours (Monday-Friday, 8AM-5PM)
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#065f46", verticalAlign: "top" }}>2.</td>
                <td style={{ padding: "8px 0", color: "#065f46" }}>
                  <strong>Bring all original documents</strong> for final verification
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#065f46", verticalAlign: "top" }}>3.</td>
                <td style={{ padding: "8px 0", color: "#065f46" }}>
                  <strong>Prepare a valid ID</strong> (government-issued preferred)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center" as const, margin: "32px 0" }}>
          <a
            href={`${process.env.BETTER_AUTH_URL}/protected/client/application/status`}
            style={{
              display: "inline-block",
              backgroundColor: "#10b981",
              color: "white",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            View Application Status
          </a>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
          If you have any questions, please don&apos;t hesitate to contact the PESO office 
          or visit us in person.
        </p>

        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
            Best regards,
          </p>
          <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: "600", margin: "4px 0 0 0" }}>
            PESO Team
          </p>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0" }}>
            City Government of Baguio
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          textAlign: "center" as const,
          padding: "24px",
          borderRadius: "0 0 12px 12px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 8px 0" }}>
          This is an automated message from the PESO System.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>
          © {new Date().getFullYear()} Public Employment Service Office • City of Baguio
        </p>
      </div>
    </div>
  );
}
