import * as React from "react";

interface GoogleNotificationEmailProps {
  applicantName: string;
  title: string;
  message: string;
  linkUrl?: string;
  linkText?: string;
}

export function GoogleNotificationEmail({
  applicantName,
  title,
  message,
  linkUrl,
  linkText = "View Details",
}: GoogleNotificationEmailProps) {
  // Format message lines to handle line breaks
  const messageLines = message.split("\n").filter((line) => line.trim() !== "");

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9fafb",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            height: "4px",
            backgroundColor: "#10b981", // PESO primary color
            width: "100%",
          }}
        />

        {/* Content */}
        <div style={{ padding: "32px" }}>
          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#ecfdf5",
                borderRadius: "8px",
                padding: "8px",
                marginRight: "16px",
                display: "inline-flex",
              }}
            >
              {/* Bell Icon representation */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                PESO Notification
              </p>
              <h2
                style={{
                  margin: "4px 0 0 0",
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                {title}
              </h2>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "32px",
              border: "1px solid #f3f4f6",
            }}
          >
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "15px",
                color: "#374151",
                lineHeight: "1.6",
              }}
            >
              Hi <strong>{applicantName}</strong>,
            </p>
            {messageLines.map((line, index) => (
              <p
                key={index}
                style={{
                  margin: index === messageLines.length - 1 ? 0 : "0 0 12px 0",
                  fontSize: "15px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {linkUrl && (
            <div style={{ textAlign: "center" as const }}>
              <a
                href={`${process.env.BETTER_AUTH_URL || "http://localhost:3000"}${
                  linkUrl.startsWith("/") ? "" : "/"
                }${linkUrl}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                }}
              >
                {linkText}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px 32px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "13px",
              lineHeight: "1.5",
              textAlign: "center" as const,
            }}
          >
            This is an automated notification from the Public Employment Service Office
            (PESO) - City Government of Baguio.
          </p>
        </div>
      </div>
    </div>
  );
}
