import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260827090000_contact_enquiries.sql"),
  "utf8",
).toLowerCase();

describe("STATIC SQL VERIFICATION: contact enquiries migration", () => {
  it("enables RLS and prevents anonymous table access", () => {
    for (const table of ["contact_enquiries", "enquiry_notes", "enquiry_audit_events"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toMatch(new RegExp(`revoke all on table public\\.${table}[\\s\\s]*?from public, anon`));
    }
    expect(migration).not.toMatch(/grant\s+(insert|update|delete|all)[^;]+to\s+anon/);
  });

  it("constrains workflow values, versions, assignments, and references", () => {
    expect(migration).toContain("status in ('new', 'in_progress', 'waiting', 'resolved', 'closed')");
    expect(migration).toContain("priority in ('low', 'normal', 'high')");
    expect(migration).toContain("notification_status in ('pending', 'sent', 'failed')");
    expect(migration).toContain("version integer not null default 1");
    expect(migration).toContain("references public.profiles(id)");
    expect(migration).toContain("reference_code ~ '^ath-[a-f0-9]{10}$'");
  });

  it("hardens SECURITY DEFINER functions and denies anonymous execution", () => {
    expect(migration).toContain("security definer\nset search_path = ''");
    expect(migration).toMatch(/revoke all on function public\.enquiry_set_status[^;]+from public, anon/);
    expect(migration).toMatch(/grant execute on function public\.enquiry_set_status[^;]+to authenticated/);
    expect(migration).toContain("raise exception 'enquiry_conflict'");
    expect(migration).toContain("insert into public.enquiry_audit_events");
  });

  it("does not persist prohibited network or secret material", () => {
    const definitions = migration.replace(/--.*$/gm, "").replace(/comment on[\s\S]*?;/g, "");
    expect(definitions).not.toMatch(/raw_ip|browser_fingerprint|rate_limit_key|access_token|refresh_token|cookie|api_key/);
    expect(migration).not.toMatch(/create\s+(or\s+replace\s+)?function[^;]*delete_enquiry/);
  });
});
