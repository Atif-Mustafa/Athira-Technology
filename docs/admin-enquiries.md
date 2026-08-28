# Admin enquiry management

## Architecture

The contact API keeps its existing JSON-only 16 KiB boundary, strict Zod validation, honeypot, origin check, pseudonymous distributed rate limit, request correlation, and privacy-safe logging. After those checks it calls the service-role-only `contact_create_enquiry` RPC. The database record is the source of truth; Resend is a notification channel.

```text
validate -> anti-abuse -> persist -> attempt notification -> update notification state
```

The browser supplies one UUID v4 submission key for the current attempt. `contact_enquiries.submission_key` is unique, so a replay returns the existing `ATH-XXXXXXXXXX` reference. Resend receives the same stable key as its idempotency key. Legitimate later enquiries are not deduplicated by email or message.

## Schema and workflow

- `contact_enquiries` stores the contact fields already collected, status, manually selected priority, validated assignee, notification state, operational timestamps, and an optimistic `version`.
- `enquiry_notes` contains plain-text internal notes. Notes never enter public responses, notification email, metadata, or public pages.
- `enquiry_audit_events` records creation, notification results, status/priority/assignment changes, and note creation/editing without message bodies or secrets.
- Statuses are `new`, `in_progress`, `waiting`, `resolved`, and `closed`.
- Priorities are `low`, `normal`, and `high`; no automated or sensitive-trait scoring exists.
- Notification status is independent: `pending`, `sent`, or `failed`.

Leaving `new` sets `first_reviewed_at` once. Closing sets `closed_at`; reopening clears it. Every mutation increments `version`. A stale expected version raises a conflict and writes no audit event.

## Authorization and RLS

RLS is enabled on all three enquiry tables. Anonymous users receive no table grants and cannot read, insert, enumerate references, or invoke mutation functions. The public API uses the service role only through two narrowly granted persistence/notification RPCs.

Active Admin, Editor, and Viewer accounts may read the inbox, detail, internal notes, and audit timeline. Admin and Editor may change workflow state, priority, assignment, and notes. Viewer is read-only. Assignment accepts active Admin/Editor profiles only. Note editing is limited to the author. Actor identity and role are derived from `auth.uid()` inside guarded `SECURITY DEFINER` functions with an empty `search_path`.

## Failure semantics

- Invalid, oversized, honeypot, origin-rejected, or rate-limited submissions create no real enquiry and send no email.
- Persistence failure returns a safe 503 and sends no email.
- Persistence plus successful notification returns 202 with only the safe reference.
- Notification rejection, missing Resend configuration, or provider failure leaves the enquiry stored, marks notification failed when the database update is available, and returns the normal accepted response. Provider details are never exposed.

There is no notification queue or manual retry in this milestone. Staff can see failed notification state and use the validated `mailto:` link as an operational fallback.

## Admin UX

`/admin/enquiries` uses server-side URL filters for status, priority, assignee, bounded search, sort, and 20-row pagination. Dense rows show a safe preview; mobile uses cards. `/admin/enquiries/[id]` shows the full escaped message, controls appropriate to the role, internal notes, and a minimal activity timeline. React text nodes and `whitespace-pre-wrap` preserve content without raw HTML.

Dashboard cards show real new, open, unassigned, and notification-failure counts. These are operational counts, not analytics.

## Privacy and retention

Stored PII is limited to the submitted contact fields required to handle the enquiry. The schema does not store raw IP addresses, rate-limit hashes, fingerprints, headers, cookies, tokens, or provider secrets. Structured logs contain only operational categories and duration.

The business owner and legal reviewer must decide and document retention, deletion/archival, access-request handling, provider agreements, and deployment regions. This milestone does not claim GDPR/CCPA compliance and does not automatically delete enquiries.

## Environment and deployment

Apply `supabase/migrations/20260827090000_contact_enquiries.sql` to Preview before deploying application code. Vercel requires the existing public Supabase variables plus server-only `SUPABASE_SECRET_KEY`, Upstash variables, site URL/origin configuration, and the Resend variables when email notification is enabled. Never expose the Supabase secret or provider tokens to client code.

## Owner acceptance

1. Submit a valid Preview enquiry and compare its public reference with the stored row.
2. Confirm notification arrives and status becomes `sent`.
3. Simulate a safe Preview-only notification failure; confirm the row remains and status is `failed`.
4. Exercise `new -> in_progress -> waiting -> resolved -> closed`, then reopen, checking timestamps, versions, and audit events.
5. Assign an active Editor, reject a disabled target, add/edit an own note, and confirm notes never appear publicly.
6. Open the same enquiry in two tabs and verify the stale mutation is rejected without an audit event.
7. Verify Viewer reads but cannot mutate, and a disabled active session loses access after refresh.
8. Inspect browser bundles, HTML, Network, logs, and stored rows for prohibited secrets and raw IP data.

## Known limitations

- Real Supabase RLS/RPC behavior requires owner-run Preview verification; static SQL tests are not runtime proof.
- There is no automated notification queue, manual retry, customer reply synchronization, deletion UI, archival policy, attachment support, CRM integration, or analytics.
- Retention policy requires an owner decision.
