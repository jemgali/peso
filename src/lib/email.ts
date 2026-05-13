import { Resend } from "resend";
import { createElement } from "react";
import { ApplicationApprovedEmail } from "@/components/email-template/application-approved";
import { ApplicationRevisionEmail } from "@/components/email-template/application-revision";
import { ApplicationRejectedEmail } from "@/components/email-template/application-rejected";
import type {
  FieldFeedback,
  DocumentFeedback,
} from "@/lib/validations/application-review";
import { GoogleNotificationEmail } from "@/components/email-template/google-notification";

const FROM_EMAIL = process.env.EMAIL_FROM as string;

interface SendApplicationEmailParams {
  to: string;
  applicantName: string;
  decision: "approved" | "needs_revision" | "rejected";
  overallComments?: string;
  fieldFeedback?: FieldFeedback[];
  documentFeedback?: DocumentFeedback[];
}

export async function sendApplicationReviewEmail({
  to,
  applicantName,
  decision,
  overallComments,
  fieldFeedback = [],
  documentFeedback = [],
}: SendApplicationEmailParams): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    let subject: string;
    let reactElement: React.ReactElement;

    switch (decision) {
      case "approved":
        subject = "Your SPES Application Has Been Approved!";
        reactElement = createElement(ApplicationApprovedEmail, {
          applicantName,
        });
        break;

      case "needs_revision":
        subject = "Your SPES Application Requires Revision";
        // Filter only invalid fields
        const fieldIssues = fieldFeedback
          .filter((f) => f.status === "invalid")
          .map((f) => ({
            fieldName: f.fieldName,
            comment: f.comment,
          }));
        // Filter invalid or missing documents
        const documentIssues = documentFeedback
          .filter((f) => f.status === "invalid" || f.status === "missing")
          .map((f) => ({
            documentType: f.documentType,
            status: f.status,
            comment: f.comment,
          }));

        reactElement = createElement(ApplicationRevisionEmail, {
          applicantName,
          overallComments,
          fieldIssues,
          documentIssues,
        });
        break;

      case "rejected":
        subject = "Update on Your SPES Application";
        reactElement = createElement(ApplicationRejectedEmail, {
          applicantName,
          reason: overallComments,
        });
        break;

      default:
        return { success: false, error: "Invalid decision type" };
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: reactElement,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending application review email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface SendEvaluationBulkNotifyEmailParams {
  to: string;
  applicantName: string;
  note?: string;
}

export async function sendEvaluationBulkNotifyEmail({
  to,
  applicantName,
  note,
}: SendEvaluationBulkNotifyEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const messageLines = [
      "PESO sent an update regarding your SPES application evaluation.",
      "Please check your application status page for details and next steps.",
    ];

    if (note?.trim()) {
      messageLines.push(`Admin note: ${note.trim()}`);
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "SPES Application Update from PESO",
      react: createElement(GoogleNotificationEmail, {
        applicantName,
        title: "SPES Evaluation Update",
        message: messageLines.join("\n"),
        linkUrl: "/protected/client/application/status",
      }),
    });

    if (error) {
      console.error("Failed to send evaluation notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending evaluation notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface SendSystemNotificationEmailParams {
  to: string;
  applicantName: string;
  title: string;
  message: string;
  linkUrl?: string;
  linkText?: string;
}

export async function sendSystemNotificationEmail({
  to,
  applicantName,
  title,
  message,
  linkUrl,
  linkText,
}: SendSystemNotificationEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: title,
      react: createElement(GoogleNotificationEmail, {
        applicantName,
        title,
        message,
        linkUrl,
        linkText,
      }),
    });

    if (error) {
      console.error("Failed to send system notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending system notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
