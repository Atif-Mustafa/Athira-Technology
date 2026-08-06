import { z } from "zod";
import {
  budgetRangeValues,
  contactInterestValues,
  projectStageValues,
} from "../../content/contact";

export const CONTACT_BODY_LIMIT_BYTES = 16 * 1024;

const optionalProjectStage = z
  .union([z.enum(projectStageValues), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const optionalBudgetRange = z
  .union([z.enum(budgetRangeValues), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

export const contactSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(100, "Full name must be 100 characters or fewer."),
    workEmail: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Work email must be 254 characters or fewer.")
      .email("Enter a valid work email address."),
    companyName: z
      .string()
      .trim()
      .min(2, "Enter your company name.")
      .max(120, "Company name must be 120 characters or fewer."),
    interest: z.enum(contactInterestValues, {
      error: "Select a product or service interest.",
    }),
    projectStage: optionalProjectStage,
    budgetRange: optionalBudgetRange,
    message: z
      .string()
      .trim()
      .min(20, "Tell us a little more about the problem you are evaluating.")
      .max(3000, "Message must be 3,000 characters or fewer."),
    consent: z.literal(true, {
      error: "Acknowledge the privacy notice before submitting.",
    }),
    website: z
      .string()
      .trim()
      .max(200, "Invalid submission.")
      .default(""),
  })
  .strict();

export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactSubmission = z.output<typeof contactSchema>;
export type ContactFieldName = keyof ContactFormInput;
export type ContactFieldErrors = Partial<Record<ContactFieldName, string[]>>;

export type ContactApiErrorCode =
  | "invalid_request"
  | "payload_too_large"
  | "validation_error"
  | "rate_limited"
  | "configuration_unavailable"
  | "delivery_failed"
  | "service_unavailable"
  | "unexpected_error";

export type ContactApiResponse =
  | {
      ok: true;
      requestId: string;
      message: string;
    }
  | {
      ok: false;
      requestId: string;
      code: ContactApiErrorCode;
      message: string;
      fieldErrors?: ContactFieldErrors;
    };

export function flattenContactErrors(error: z.ZodError): ContactFieldErrors {
  const flattened = z.flattenError(error);

  return Object.fromEntries(
    Object.entries(flattened.fieldErrors).filter(
      (entry): entry is [ContactFieldName, string[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0,
    ),
  );
}
