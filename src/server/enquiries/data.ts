import "server-only";

import { createSupabaseServerClient } from "../../lib/supabase/server";
import type { EnquiryViewerContext } from "./guards";
import { ENQUIRY_PAGE_SIZE, type EnquiryListParams } from "./schema";
import type {
  AssignableStaff,
  Enquiry,
  EnquiryAuditEvent,
  EnquiryCounts,
  EnquiryList,
  EnquiryNote,
  EnquiryPriority,
  EnquiryStatus,
  NotificationStatus,
} from "./types";

type ProfileRelation = { display_name?: string | null } | Array<{ display_name?: string | null }> | null;

type EnquiryRow = {
  id: string;
  reference_code: string;
  full_name: string;
  work_email: string;
  company_name: string;
  interest: string;
  project_stage: string | null;
  budget_range: string | null;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  assigned_to: string | null;
  notification_status: NotificationStatus;
  created_at: string;
  updated_at: string;
  first_reviewed_at: string | null;
  closed_at: string | null;
  version: number;
  assignee?: ProfileRelation;
};

type NoteRow = {
  id: string;
  enquiry_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author?: ProfileRelation;
};

type AuditRow = {
  id: string;
  enquiry_id: string;
  actor_user_id: string | null;
  action: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  actor?: ProfileRelation;
};

function relationName(relation: ProfileRelation | undefined, fallback: string): string {
  const profile = Array.isArray(relation) ? relation[0] : relation;
  return profile?.display_name?.trim() || fallback;
}

function mapEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    fullName: row.full_name,
    workEmail: row.work_email,
    companyName: row.company_name,
    interest: row.interest,
    projectStage: row.project_stage,
    budgetRange: row.budget_range,
    message: row.message,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    assigneeName: row.assigned_to ? relationName(row.assignee, "Former staff member") : null,
    notificationStatus: row.notification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    firstReviewedAt: row.first_reviewed_at,
    closedAt: row.closed_at,
    version: row.version,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listEnquiries(
  _context: EnquiryViewerContext,
  params: EnquiryListParams,
): Promise<EnquiryList> {
  const client = await createSupabaseServerClient();
  const start = (params.page - 1) * ENQUIRY_PAGE_SIZE;
  let query = client
    .from("contact_enquiries")
    .select(
      "id,reference_code,full_name,work_email,company_name,interest,project_stage,budget_range,message,status,priority,assigned_to,notification_status,created_at,updated_at,first_reviewed_at,closed_at,version,assignee:profiles!contact_enquiries_assigned_to_fkey(display_name)",
      { count: "exact" },
    );

  if (params.status !== "all") query = query.eq("status", params.status);
  if (params.priority !== "all") query = query.eq("priority", params.priority);
  if (params.assignee === "unassigned") query = query.is("assigned_to", null);
  else if (params.assignee !== "all") query = query.eq("assigned_to", params.assignee);
  if (params.query) query = query.ilike("search_text", `%${escapeLike(params.query.toLowerCase())}%`);

  const { data, count, error } = await query
    .order("created_at", { ascending: params.sort === "oldest" })
    .order("id", { ascending: params.sort === "oldest" })
    .range(start, start + ENQUIRY_PAGE_SIZE - 1);
  if (error) throw new Error("Unable to load enquiries.");

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / ENQUIRY_PAGE_SIZE));
  return {
    enquiries: ((data ?? []) as unknown as EnquiryRow[]).map(mapEnquiry),
    total,
    page: Math.min(params.page, pageCount),
    pageCount,
    pageSize: ENQUIRY_PAGE_SIZE,
  };
}

export async function getEnquiryDetail(
  _context: EnquiryViewerContext,
  enquiryId: string,
): Promise<{ enquiry: Enquiry; notes: EnquiryNote[]; audit: EnquiryAuditEvent[] } | null> {
  const client = await createSupabaseServerClient();
  const [enquiryResult, notesResult, auditResult] = await Promise.all([
    client.from("contact_enquiries").select(
      "id,reference_code,full_name,work_email,company_name,interest,project_stage,budget_range,message,status,priority,assigned_to,notification_status,created_at,updated_at,first_reviewed_at,closed_at,version,assignee:profiles!contact_enquiries_assigned_to_fkey(display_name)",
    ).eq("id", enquiryId).maybeSingle(),
    client.from("enquiry_notes").select(
      "id,enquiry_id,author_user_id,body,created_at,updated_at,author:profiles!enquiry_notes_author_user_id_fkey(display_name)",
    ).eq("enquiry_id", enquiryId).order("created_at", { ascending: true }),
    client.from("enquiry_audit_events").select(
      "id,enquiry_id,actor_user_id,action,previous_value,new_value,created_at,actor:profiles!enquiry_audit_events_actor_user_id_fkey(display_name)",
    ).eq("enquiry_id", enquiryId).order("created_at", { ascending: true }),
  ]);

  if (enquiryResult.error || notesResult.error || auditResult.error) {
    throw new Error("Unable to load the enquiry.");
  }
  if (!enquiryResult.data) return null;

  return {
    enquiry: mapEnquiry(enquiryResult.data as unknown as EnquiryRow),
    notes: ((notesResult.data ?? []) as unknown as NoteRow[]).map((row) => ({
      id: row.id,
      enquiryId: row.enquiry_id,
      authorUserId: row.author_user_id,
      authorName: relationName(row.author, "Former staff member"),
      body: row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    audit: ((auditResult.data ?? []) as unknown as AuditRow[]).map((row) => ({
      id: row.id,
      enquiryId: row.enquiry_id,
      actorUserId: row.actor_user_id,
      actorName: row.actor_user_id ? relationName(row.actor, "Former staff member") : "System",
      action: row.action,
      previousValue: row.previous_value,
      newValue: row.new_value,
      createdAt: row.created_at,
    })),
  };
}

export async function listAssignableStaff(
  _context: EnquiryViewerContext,
): Promise<AssignableStaff[]> {
  void _context;
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("enquiry_assignable_staff");
  if (error) throw new Error("Unable to load assignable staff.");
  return ((data ?? []) as Array<{ user_id: string; display_name: string; role: "admin" | "editor" }>).map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    role: row.role,
  }));
}

export async function getEnquiryCounts(
  _context: EnquiryViewerContext,
): Promise<EnquiryCounts> {
  void _context;
  const client = await createSupabaseServerClient();
  const [newResult, openResult, unassignedResult, failureResult] = await Promise.all([
    client.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("contact_enquiries").select("id", { count: "exact", head: true }).neq("status", "closed"),
    client.from("contact_enquiries").select("id", { count: "exact", head: true }).is("assigned_to", null).neq("status", "closed"),
    client.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("notification_status", "failed"),
  ]);
  if (newResult.error || openResult.error || unassignedResult.error || failureResult.error) {
    throw new Error("Unable to load enquiry counts.");
  }
  return {
    new: newResult.count ?? 0,
    open: openResult.count ?? 0,
    unassigned: unassignedResult.count ?? 0,
    notificationFailures: failureResult.count ?? 0,
  };
}
