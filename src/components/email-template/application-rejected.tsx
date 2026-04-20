import * as React from "react";

interface ApplicationRejectedEmailProps {
  applicantName: string;
  reason?: string;
}

export function ApplicationRejectedEmail({
  applicantName,
  reason,
}: ApplicationRejectedEmailProps) {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          padding: "32px 24px",
          textAlign: "center" as const,
          borderRadius: "12px 12px 0 0",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
        <h1 style={{ 
          color: "white", 
          margin: "0 0 8px 0",
          fontSize: "28px",
          fontWeight: "700",
        }}>
          Application Status Update
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
          We regret to inform you that your SPES application has not been approved
          at this time.
        </p>

        {/* Reason box */}
        {reason && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "2px solid #fecaca",
              borderRadius: "12px",
              padding: "24px",
              margin: "24px 0",
            }}
          >
            <h3 style={{ 
              color: "#991b1b", 
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              📝 Feedback from Reviewer:
            </h3>
            <p style={{ color: "#7f1d1d", margin: 0, lineHeight: "1.6" }}>{reason}</p>
          </div>
        )}

        {/* Information box */}
        <div
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: "12px",
            padding: "24px",
            margin: "24px 0",
          }}
        >
          <h3 style={{ 
            color: "#374151", 
            margin: "0 0 16px 0",
            fontSize: "16px",
            fontWeight: "600",
          }}>
            📍 Need More Information?
          </h3>
          <p style={{ color: "#4b5563", margin: "0 0 12px 0", lineHeight: "1.6" }}>
            If you believe this decision was made in error or would like to discuss your application, 
            please visit us:
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", color: "#6b7280", width: "80px" }}>Location:</td>
                <td style={{ padding: "4px 0", color: "#374151", fontWeight: "500" }}>PESO Office, City Hall</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#6b7280" }}>Hours:</td>
                <td style={{ padding: "4px 0", color: "#374151", fontWeight: "500" }}>Mon-Fri, 8:00 AM - 5:00 PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
          We encourage you to apply again in the future if you meet the eligibility requirements.
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
