"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { requireEnquiryEditor } from "../../../server/enquiries/guards";
import {
  enquiryIdSchema,
  enquiryNoteSchema,
  enquiryPrioritySchema,
  enquiryStatusSchema,
  enquiryVersionSchema,
} from "../../../server/enquiries/schema";

export type EnquiryActionState = {
  kind: "idle" | "success" | "error" | "conflict";
  message?: string;
};

const initialMutationSchema = z.object({
  enquiryId: enquiryIdSchema,
  version: enquiryVersionSchema,
});

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function mutationError(error: unknown, fallback: string): EnquiryActionState {
  const candidate = error as { code?: string; message?: string } | null;
  const message = candidate?.message?.toLowerCase() ?? "";
  if (candidate?.code === "40001" || message.includes("enquiry_conflict")) {
    return { kind: "conflict", message: "This enquiry changed since you opened it. Reload before updating." };
  }
  if (candidate?.code === "42501" || message.includes("enquiry_forbidden")) {
    return { kind: "error", message: "You are not allowed to change this enquiry." };
  }
  if (message.includes("invalid_assignee")) {
    return { kind: "error", message: "Choose an active administrator or editor." };
  }
  if (message.includes("invalid_transition")) {
    return { kind: "error", message: "That status transition is not allowed." };
  }
  if (candidate?.code === "P0002" || message.includes("not_found")) {
    return { kind: "error", message: "This enquiry or note no longer exists." };
  }
  return { kind: "error", message: fallback };
}

function revalidateEnquiry(enquiryId: string) {
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  revalidatePath("/admin/dashboard");
}

export async function setEnquiryStatusAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireEnquiryEditor("/admin/enquiries");
  const parsed = initialMutationSchema.extend({ status: enquiryStatusSchema }).safeParse({
    enquiryId: formString(formData, "enquiryId"),
    version: formString(formData, "version"),
    status: formString(formData, "status"),
  });
  if (!parsed.success) return { kind: "error", message: "Choose a valid status and reload the enquiry." };

  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.rpc("enquiry_set_status", {
      target_enquiry_id: parsed.data.enquiryId,
      expected_version: parsed.data.version,
      new_status: parsed.data.status,
    });
    if (error) return mutationError(error, "The status could not be changed.");
    revalidateEnquiry(parsed.data.enquiryId);
    return { kind: "success", message: "Status updated." };
  } catch (error) {
    return mutationError(error, "The status service is temporarily unavailable.");
  }
}

export async function setEnquiryPriorityAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireEnquiryEditor("/admin/enquiries");
  const parsed = initialMutationSchema.extend({ priority: enquiryPrioritySchema }).safeParse({
    enquiryId: formString(formData, "enquiryId"),
    version: formString(formData, "version"),
    priority: formString(formData, "priority"),
  });
  if (!parsed.success) return { kind: "error", message: "Choose a valid priority and reload the enquiry." };

  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.rpc("enquiry_set_priority", {
      target_enquiry_id: parsed.data.enquiryId,
      expected_version: parsed.data.version,
      new_priority: parsed.data.priority,
    });
    if (error) return mutationError(error, "The priority could not be changed.");
    revalidateEnquiry(parsed.data.enquiryId);
    return { kind: "success", message: "Priority updated." };
  } catch (error) {
    return mutationError(error, "The priority service is temporarily unavailable.");
  }
}

export async function assignEnquiryAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireEnquiryEditor("/admin/enquiries");
  const assigneeValue = formString(formData, "assigneeId");
  const parsed = initialMutationSchema.extend({
    assigneeId: z.union([enquiryIdSchema, z.literal("")]),
  }).safeParse({
    enquiryId: formString(formData, "enquiryId"),
    version: formString(formData, "version"),
    assigneeId: assigneeValue,
  });
  if (!parsed.success) return { kind: "error", message: "Choose a valid assignee and reload the enquiry." };

  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.rpc("enquiry_assign", {
      target_enquiry_id: parsed.data.enquiryId,
      expected_version: parsed.data.version,
      new_assignee: parsed.data.assigneeId || null,
    });
    if (error) return mutationError(error, "The assignment could not be changed.");
    revalidateEnquiry(parsed.data.enquiryId);
    return { kind: "success", message: parsed.data.assigneeId ? "Enquiry assigned." : "Enquiry unassigned." };
  } catch (error) {
    return mutationError(error, "The assignment service is temporarily unavailable.");
  }
}

export async function addEnquiryNoteAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireEnquiryEditor("/admin/enquiries");
  const parsed = initialMutationSchema.extend({ note: enquiryNoteSchema }).safeParse({
    enquiryId: formString(formData, "enquiryId"),
    version: formString(formData, "version"),
    note: formString(formData, "note"),
  });
  if (!parsed.success) return { kind: "error", message: "Enter a note of 4,000 characters or fewer." };

  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.rpc("enquiry_add_note", {
      target_enquiry_id: parsed.data.enquiryId,
      expected_version: parsed.data.version,
      note_body: parsed.data.note,
    });
    if (error) return mutationError(error, "The internal note could not be added.");
    revalidateEnquiry(parsed.data.enquiryId);
    return { kind: "success", message: "Internal note added." };
  } catch (error) {
    return mutationError(error, "The notes service is temporarily unavailable.");
  }
}

export async function editEnquiryNoteAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireEnquiryEditor("/admin/enquiries");
  const parsed = initialMutationSchema.extend({
    noteId: enquiryIdSchema,
    note: enquiryNoteSchema,
  }).safeParse({
    enquiryId: formString(formData, "enquiryId"),
    version: formString(formData, "version"),
    noteId: formString(formData, "noteId"),
    note: formString(formData, "note"),
  });
  if (!parsed.success) return { kind: "error", message: "Enter a valid note of 4,000 characters or fewer." };

  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.rpc("enquiry_edit_note", {
      target_note_id: parsed.data.noteId,
      expected_version: parsed.data.version,
      note_body: parsed.data.note,
    });
    if (error) return mutationError(error, "The internal note could not be edited.");
    revalidateEnquiry(parsed.data.enquiryId);
    return { kind: "success", message: "Internal note updated." };
  } catch (error) {
    return mutationError(error, "The notes service is temporarily unavailable.");
  }
}
