import "server-only";

import type { AdminAuthContext } from "../auth/guards";
import { createSupabaseAdminClientForAdmin } from "../../lib/supabase/admin";
import { APP_ROLES, parseAppRole, type AppRole } from "../auth/roles";

export const USER_PAGE_SIZE = 20;
export const MAX_USER_SEARCH_LENGTH = 80;
export const MAX_USER_PAGE = 1000;

export type AdminDirectoryUser = {
  id: string;
  email: string;
  displayName: string;
  display_name: string;
  status: "active" | "disabled";
  role: AppRole;
  createdAt: string;
  created_at: string;
  lastSignInAt: string | null;
  last_sign_in_at: string | null;
  emailConfirmedAt: string | null;
};

export type AdminAuditEvent = {
  id: string;
  actorUserId: string;
  targetUserId: string;
  action: "USER_INVITED" | "ROLE_CHANGED" | "USER_DISABLED" | "USER_ENABLED";
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
  created_at: string;
};

export type AdminUserList = {
  users: AdminDirectoryUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  pageCount: number;
};

type DirectoryRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  status: string | null;
  role: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

type AuditRow = {
  id: string;
  actor_user_id: string;
  target_user_id: string;
  action: AdminAuditEvent["action"];
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export function normalizeUserSearch(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_USER_SEARCH_LENGTH) : "";
}

export function parseUserPage(value: unknown): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  return Math.min(Math.max(Number.parseInt(value, 10) || 1, 1), MAX_USER_PAGE);
}

export function parseUserListParams(searchParams: Record<string, string | string[] | undefined>): {
  search: string;
  query: string;
  page: number;
} {
  const getFirst = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return {
    search: normalizeUserSearch(getFirst(searchParams.q)),
    query: normalizeUserSearch(getFirst(searchParams.q)),
    page: parseUserPage(getFirst(searchParams.page)),
  };
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function toDirectoryUser(row: DirectoryRow): AdminDirectoryUser {
  return {
    id: row.id,
    email: row.email ?? "",
    displayName: row.display_name?.trim() || "Unnamed user",
    display_name: row.display_name?.trim() || "Unnamed user",
    status: row.status === "active" ? "active" : "disabled",
    role: parseAppRole(row.role) ?? "viewer",
    createdAt: row.created_at,
    created_at: row.created_at,
    lastSignInAt: row.last_sign_in_at,
    last_sign_in_at: row.last_sign_in_at,
    emailConfirmedAt: row.email_confirmed_at,
  };
}

function asSupabaseError(error: unknown): { message?: string } | null {
  return error && typeof error === "object" ? (error as { message?: string }) : null;
}

export async function listAdminUsers(
  admin: AdminAuthContext,
  params: { search: string; query?: string; page: number },
): Promise<AdminUserList> {
  const client = createSupabaseAdminClientForAdmin(admin);
  const search = normalizeUserSearch(params.search);
  const requestedPage = Math.min(Math.max(params.page, 1), MAX_USER_PAGE);
  const pattern = search ? `%${escapeLikePattern(search.toLowerCase())}%` : "%";

  const query = client
    .from("admin_user_directory")
    .select(
      "id,email,display_name,status,role,created_at,last_sign_in_at,email_confirmed_at",
      { count: "exact" },
    )
    .ilike("search_text", pattern)
    .order("created_at", { ascending: false })
    .range((requestedPage - 1) * USER_PAGE_SIZE, requestedPage * USER_PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(asSupabaseError(error)?.message || "Unable to load users.");

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / USER_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  return {
    users: ((data ?? []) as DirectoryRow[]).map(toDirectoryUser),
    total,
    page,
    pageSize: USER_PAGE_SIZE,
    totalPages,
    pageCount: totalPages,
  };
}

export async function getAdminUser(
  admin: AdminAuthContext,
  userId: string,
): Promise<AdminDirectoryUser | null> {
  const client = createSupabaseAdminClientForAdmin(admin);
  const { data, error } = await client
    .from("admin_user_directory")
    .select("id,email,display_name,status,role,created_at,last_sign_in_at,email_confirmed_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(asSupabaseError(error)?.message || "Unable to load the user.");
  return data ? toDirectoryUser(data as DirectoryRow) : null;
}

export async function listAdminAuditEvents(
  admin: AdminAuthContext,
  userId: string,
): Promise<AdminAuditEvent[]> {
  const client = createSupabaseAdminClientForAdmin(admin);
  const { data, error } = await client
    .from("admin_audit_events")
    .select("id,actor_user_id,target_user_id,action,previous_value,new_value,created_at")
    .eq("target_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(asSupabaseError(error)?.message || "Unable to load the audit history.");

  return ((data ?? []) as AuditRow[]).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    targetUserId: row.target_user_id,
    action: row.action,
    previousValue: row.previous_value,
    newValue: row.new_value,
    createdAt: row.created_at,
    created_at: row.created_at,
  }));
}

export const supportedAdminRoles: readonly AppRole[] = APP_ROLES;
