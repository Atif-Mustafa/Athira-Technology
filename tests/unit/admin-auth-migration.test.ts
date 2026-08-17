import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260814000000_admin_auth_rbac.sql"),
  "utf8",
);

describe("admin auth migration safeguards", () => {
  it("defines the smallest supported role and profile model", () => {
    expect(migration).toContain("create type public.app_role as enum ('admin', 'editor', 'viewer')");
    expect(migration).toContain("create table public.profiles");
    expect(migration).toContain("create table public.user_roles");
    expect(migration).toContain("references auth.users(id) on delete cascade");
  });

  it("creates a least-privilege viewer profile idempotently for new auth users", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = public");
    expect(migration).toContain("drop trigger if exists on_auth_user_created on auth.users");
    expect(migration).toContain("values (new.id, 'viewer'::public.app_role)");
    expect(migration).toContain("on conflict (user_id, role) do nothing");
  });

  it("enables RLS and prevents client-side self-role mutation", () => {
    expect(migration).toContain("alter table public.profiles enable row level security");
    expect(migration).toContain("alter table public.user_roles enable row level security");
    expect(migration).toContain("profiles_select_own_or_admin");
    expect(migration).toContain("user_roles_select_own_or_admin");
    expect(migration).toContain("user_roles_admin_insert_for_other_users");
    expect(migration).toContain("user_roles_admin_update_for_other_users");
    expect(migration).toContain("user_roles_admin_delete_for_other_users");
    expect(migration.match(/user_id <> \(select auth\.uid\(\)\)/g)).toHaveLength(4);
    expect(migration).not.toMatch(/using \(true\)/i);
  });
});
