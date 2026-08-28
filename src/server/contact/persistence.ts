import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContactSubmission } from "../../lib/contact/schema";
import { getSupabaseAdminConfig } from "../env";

export type ContactPersistenceResult = {
  enquiryId: string;
  referenceCode: string;
  notificationStatus: "pending" | "sent" | "failed";
  created: boolean;
};

export interface ContactPersistenceProvider {
  persist(
    submission: ContactSubmission,
    requestId: string,
    submissionKey: string,
  ): Promise<ContactPersistenceResult>;
  setNotificationStatus(
    enquiryId: string,
    status: "sent" | "failed",
  ): Promise<void>;
}

type PersistenceRow = {
  enquiry_id: string;
  enquiry_reference: string;
  enquiry_notification_status: "pending" | "sent" | "failed";
  was_created: boolean;
};

export class ContactPersistenceUnavailableError extends Error {
  constructor() {
    super("Contact persistence is unavailable.");
    this.name = "ContactPersistenceUnavailableError";
  }
}

export class SupabaseContactPersistenceProvider implements ContactPersistenceProvider {
  constructor(private readonly client: SupabaseClient) {}

  async persist(
    submission: ContactSubmission,
    requestId: string,
    submissionKey: string,
  ): Promise<ContactPersistenceResult> {
    const { data, error } = await this.client.rpc("contact_create_enquiry", {
      new_submission_key: submissionKey,
      new_request_id: requestId,
      new_full_name: submission.fullName,
      new_work_email: submission.workEmail,
      new_company_name: submission.companyName,
      new_interest: submission.interest,
      new_project_stage: submission.projectStage ?? null,
      new_budget_range: submission.budgetRange ?? null,
      new_message: submission.message,
    });

    const row = (Array.isArray(data) ? data[0] : data) as PersistenceRow | null;
    if (
      error ||
      !row?.enquiry_id ||
      !/^ATH-[A-F0-9]{10}$/.test(row.enquiry_reference) ||
      !["pending", "sent", "failed"].includes(row.enquiry_notification_status)
    ) {
      throw new ContactPersistenceUnavailableError();
    }

    return {
      enquiryId: row.enquiry_id,
      referenceCode: row.enquiry_reference,
      notificationStatus: row.enquiry_notification_status,
      created: row.was_created,
    };
  }

  async setNotificationStatus(
    enquiryId: string,
    status: "sent" | "failed",
  ): Promise<void> {
    const { error } = await this.client.rpc("contact_set_notification_status", {
      target_enquiry_id: enquiryId,
      new_notification_status: status,
    });
    if (error) throw new ContactPersistenceUnavailableError();
  }
}

export function createContactPersistenceProvider(): ContactPersistenceProvider {
  const configuration = getSupabaseAdminConfig(process.env);
  if (!configuration.success) throw new ContactPersistenceUnavailableError();

  return new SupabaseContactPersistenceProvider(
    createClient(configuration.config.url, configuration.config.secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }),
  );
}
