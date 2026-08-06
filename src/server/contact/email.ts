import { Resend } from "resend";
import {
  budgetRangeOptions,
  contactInterestOptions,
  getContactOptionLabel,
  projectStageOptions,
} from "../../content/contact";
import type { ContactSubmission } from "../../lib/contact/schema";
import type { ContactServerConfig } from "../env";

export type ContactEmailMessage = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  requestId: string;
};

export type ContactEmailResult =
  | { status: "accepted"; providerMessageId: string }
  | { status: "rejected" }
  | { status: "unavailable" };

export interface ContactEmailProvider {
  send(message: ContactEmailMessage): Promise<ContactEmailResult>;
}

export function mapResendErrorStatus(
  statusCode: number | null,
): "rejected" | "unavailable" {
  return (statusCode ?? 500) >= 500 ? "unavailable" : "rejected";
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return replacements[character];
  });
}

export function renderContactEmail(
  submission: ContactSubmission,
  config: ContactServerConfig,
  requestId: string,
  submittedAt: string,
): ContactEmailMessage {
  const interest = getContactOptionLabel(contactInterestOptions, submission.interest);
  const projectStage = getContactOptionLabel(projectStageOptions, submission.projectStage);
  const budgetRange = getContactOptionLabel(budgetRangeOptions, submission.budgetRange);
  const fields = [
    ["Request ID", requestId],
    ["Submitted at", submittedAt],
    ["Full name", submission.fullName],
    ["Work email", submission.workEmail],
    ["Company", submission.companyName],
    ["Area of interest", interest],
    ["Project stage", projectStage],
    ["Indicative budget", budgetRange],
    ["Message", submission.message],
  ] as const;

  const text = fields.map(([label, value]) => `${label}:\n${value}`).join("\n\n");
  const html = `<h1>New Athira Technology website enquiry</h1>${fields
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`,
    )
    .join("")}`;

  return {
    from: config.email.fromEmail,
    to: config.email.toEmail,
    replyTo: submission.workEmail,
    subject: `New website enquiry: ${interest}`,
    text,
    html,
    requestId,
  };
}

export class ResendContactEmailProvider implements ContactEmailProvider {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: ContactEmailMessage): Promise<ContactEmailResult> {
    try {
      const { data, error } = await this.client.emails.send(
        {
          from: message.from,
          to: [message.to],
          replyTo: message.replyTo,
          subject: message.subject,
          text: message.text,
          html: message.html,
        },
        { idempotencyKey: message.requestId },
      );

      if (error) {
        return { status: mapResendErrorStatus(error.statusCode) };
      }

      return data?.id
        ? { status: "accepted", providerMessageId: data.id }
        : { status: "unavailable" };
    } catch {
      return { status: "unavailable" };
    }
  }
}

export function createContactEmailProvider(
  config: ContactServerConfig,
): ContactEmailProvider {
  return new ResendContactEmailProvider(config.email.apiKey);
}
