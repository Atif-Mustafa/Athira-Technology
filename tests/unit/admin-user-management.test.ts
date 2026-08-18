import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  MAX_USER_PAGE,
  MAX_USER_SEARCH_LENGTH,
  parseUserListParams,
  parseUserPage,
  normalizeUserSearch,
} from "@/server/admin/users";
vi.mock("server-only", () => ({}));

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260817100000_admin_user_management.sql"),
  "utf8",
);

describe("admin user-management query boundaries", () => {
  it("normalizes and bounds search input", () => {
    expect(normalizeUserSearch("  Ada@example.com  ")).toBe("Ada@example.com");
    expect(normalizeUserSearch("x".repeat(MAX_USER_SEARCH_LENGTH + 20))).toHaveLength(MAX_USER_SEARCH_LENGTH);
    expect(normalizeUserSearch(42)).toBe("");
  });

  it("defaults invalid pages and clamps extreme pages", () => {
    expect(parseUserPage(undefined)).toBe(1);
    expect(parseUserPage("abc")).toBe(1);
    expect(parseUserPage("0")).toBe(1);
    expect(parseUserPage(String(MAX_USER_PAGE + 10))).toBe(MAX_USER_PAGE);
    expect(parseUserListParams({ q: [" Ada ", "ignored"], page: "3" })).toEqual({ search: "Ada", query: "Ada", page: 3 });
  });
});

describe("admin user-management migration safeguards", () => {
  it("keeps the directory and audit records server-readable only", () => {
    expect(migration).toContain("create table public.admin_audit_events");
    expect(migration).toContain("create or replace view public.admin_user_directory");
    expect(migration).toContain("alter table public.admin_audit_events enable row level security");
    expect(migration).toContain("revoke all on public.admin_audit_events from public, anon, authenticated, service_role");
    expect(migration).toContain("revoke all on public.admin_user_directory from public, anon, authenticated, service_role");
    expect(migration).not.toMatch(/using \(true\)/i);
  });

  it("uses guarded database functions for every mutation", () => {
    for (const name of ["admin_finalize_invitation", "admin_change_user_role", "admin_set_user_status"]) {
      expect(migration).toContain(`create or replace function public.${name}`);
    }
    expect(migration.match(/security definer/g)).toHaveLength(4);
    expect(migration.match(/set search_path = public, auth/g)).toHaveLength(4);
    expect(migration).toContain("self_protection");
    expect(migration).toContain("last_active_admin");
    expect(migration).toContain("USER_INVITED");
    expect(migration).toContain("USER_DISABLED");
    expect(migration).toContain("USER_ENABLED");
  });
});
