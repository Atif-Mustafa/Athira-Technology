import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260819090000_cms.sql"), "utf8");
const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

describe("CMS migration static SQL invariants", () => {
  it("creates the four content entities and bounded revision history", () => {
    for (const table of ["pages", "posts", "services", "pricing_plans", "content_revisions"]) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
    expect(migration).toContain("create type public.cms_content_status as enum ('draft', 'published', 'archived')");
    expect(migration).toContain("version integer not null default 1");
    expect(migration).toContain("canonical_path = '/' || slug");
    expect(migration).toContain("previous_data jsonb");
    expect(migration).toContain("new_data jsonb");
  });

  it("makes only intentionally public records anonymously readable", () => {
    expect(migration).toContain("status = 'published' and published_at <= timezone('utc', now())");
    expect(migration).toContain("using (active = true)");
    expect(migration).toContain("revoke all on public.content_revisions from public, anon, authenticated");
    expect(migration).not.toContain("grant select on public.content_revisions to anon");
    expect(migration).not.toMatch(/grant (insert|update|delete|all) on public\.(pages|posts|services|pricing_plans) to (anon|authenticated)/i);
    expect(migration).toContain("grant select (id, slug, title");
    expect(migration).not.toContain("grant select on public.pages to anon, authenticated");
  });

  it("uses role-checked security-definer mutations with a fixed search path", () => {
    for (const fn of ["cms_save_page", "cms_save_post", "cms_save_service", "cms_save_pricing_plan"]) {
      expect(migration).toContain(`create or replace function public.${fn}`);
    }
    expect(migration.match(/security definer/g)).toHaveLength(6);
    expect(migration.match(/set search_path = pg_catalog/g)).toHaveLength(6);
    expect(migration.match(/cms_forbidden/g)?.length).toBeGreaterThanOrEqual(5);
    expect(migration).toContain("array['admin', 'editor']::public.app_role[]");
    expect(migration).toContain("array['admin', 'editor', 'viewer']::public.app_role[]");
    expect(migration).toContain("from public, anon, service_role");
    expect(migration).toMatch(/cms_actor_has_any_role\(\r?\n\s*required_roles public\.app_role\[\]/);
    expect(migration).not.toMatch(/cms_actor_has_any_role\(\r?\n\s*actor uuid/);
    expect(migration).not.toContain("for select to anon, authenticated");
    expect(migration.match(/where target_user_id in/g)).toHaveLength(4);
  });

  it("prevents silent overwrites and writes revisions in the same functions", () => {
    expect(migration.match(/previous_row\.version is distinct from expected_version/g)).toHaveLength(4);
    expect(migration.match(/expected_version is distinct from 0/g)).toHaveLength(4);
    expect(migration.match(/raise exception 'cms_conflict'/g)).toHaveLength(8);
    expect(migration.match(/insert into public\.content_revisions/g)).toHaveLength(4);
    for (const action of ["CREATED", "UPDATED", "PUBLISHED", "UNPUBLISHED", "ARCHIVED", "RESTORED"]) {
      expect(migration).toContain(`'${action}'`);
    }
  });

  it("seeds existing public content idempotently without overwriting edits", () => {
    expect(seed).toContain("on conflict (slug) do nothing");
    expect(seed.match(/on conflict \(slug\) do nothing/g)).toHaveLength(3);
    expect(seed).toContain("'multi-agent-systems-for-the-sdlc'");
    expect(seed).toContain("'ai-product-strategy'");
    expect(seed).toContain("'growth'");
    expect(seed).toContain("where not exists");
  });
});
