# Admin user management

This milestone adds functional, admin-only user management to the Athira Technology admin workspace. It does not implement CMS, analytics, SEO management, enquiry management, billing, or AI-agent execution.

## Architecture

- Supabase Auth remains the identity, invitation, and password source of truth.
- `profiles.status` is the reversible application access state: `active` or `disabled`.
- `user_roles` remains the authoritative application role store: `admin`, `editor`, or `viewer`.
- `requireAdminRole()` performs a fresh server-side identity, profile-status, and role check for the page and every mutation.
- `/admin/users` uses a protected `admin_user_directory` view over only safe directory fields. Search and pagination are performed by PostgREST against the database; the application never downloads every Auth user.
- `/admin/users/[id]` shows operational account data and the recent audit events for that target.

A disabled profile is denied by the same server guard even when an old session cookie is still valid. The Auth identity is not deleted when access is disabled.

## Privileged Supabase client

`src/lib/supabase/admin.ts` is marked with `import "server-only"`. It creates a non-persistent Supabase client using `SUPABASE_SECRET_KEY` only after the caller has passed `requireAdminRole()`. It is used for the administrative directory and `auth.admin.inviteUserByEmail()`. It is not used for ordinary authenticated reads or for role/status RPCs.

The secret is never placed in client props, HTML, API responses, logs, or `NEXT_PUBLIC_` variables. Provider errors are mapped to safe user-facing messages.

## Roles and invitation flow

The supported roles are exactly:

- `admin`: may access user management and the dashboard.
- `editor`: may access the dashboard but receives the forbidden boundary for user management.
- `viewer`: may access the dashboard but receives the forbidden boundary for user management.

The invitation form defaults to `viewer`, validates email, display name, and role on the server, and sends through Supabase Auth from a server action. The new Auth user trigger creates an application profile and default viewer role. `admin_finalize_invitation()` then assigns the requested role and writes a `USER_INVITED` event.

Role changes are performed by `admin_change_user_role()` through the authenticated session client. The database function checks the current JWT actor, active profile status, exact role, self-protection, and final-active-admin invariant before replacing the target's role rows and writing `ROLE_CHANGED`. Role changes are visible on the next server authorization check; no JWT role claim cache is used by this application.

## Disable and re-enable model

Disablement updates `profiles.status` to `disabled`. It is reversible and does not delete the Auth user or stored role. `admin_set_user_status()` writes `USER_DISABLED` or `USER_ENABLED` and serializes sensitive mutations with a transaction advisory lock.

An existing session is denied at the next protected-page request because guards read profile status from the database. Re-enabling an account restores access when its role is still valid.

## Self-protection and final-admin protection

The current administrator cannot demote themselves or disable themselves. These checks exist in the UI for clarity, in server actions for safe validation, and in PostgreSQL functions for authoritative enforcement.

The database functions serialize role/status mutations and reject demotion or disablement when the target is the final active administrator. A disabled administrator may retain the stored role while inaccessible; the invariant concerns active administrators.

## Audit log

`public.admin_audit_events` records:

- `USER_INVITED`
- `ROLE_CHANGED`
- `USER_DISABLED`
- `USER_ENABLED`

Each event stores actor ID, target ID, previous value, new value, and UTC creation time. Passwords, tokens, provider payloads, headers, and secrets are never logged.

RLS is enabled. Normal `anon` and `authenticated` clients have no table privileges; only the trusted server client can read audit history. The security-definer mutation functions write rows. There is no normal user-facing update or delete path.

## Environment and Vercel

Public configuration:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Server-only secret:

```text
SUPABASE_SECRET_KEY
```

Configure `SUPABASE_SECRET_KEY` manually in Vercel Preview and Production as a server-only secret. Mark it **SERVER ONLY**, **SECRET**, and **NEVER NEXT_PUBLIC**. Do not commit a real value. Marketing pages and public contact functionality do not require this secret; the Users module shows a safe configuration-unavailable state when it is absent.

Apply `supabase/migrations/20260817100000_admin_user_management.sql` after the Auth/RBAC migration. The migration requires the existing `app_role`, `profiles`, and `user_roles` objects.

## Preview setup

1. Apply both migrations to the Supabase Preview project.
2. Keep public signup disabled.
3. Configure the two public Supabase variables and `SUPABASE_SECRET_KEY` in the Vercel Preview environment.
4. Confirm the Supabase Auth URL configuration includes the exact Preview origin and the invitation redirect is allowed.
5. Redeploy after environment changes.
6. Sign in as an active admin and open `/admin/users`.

## Manual real-Supabase acceptance

The owner must perform the invitation, role promotion, self-protection, final-admin, disable/re-enable, audit, public-site, and contact-form checks described in the milestone request against the Preview deployment. These actions are intentionally not automated here and no production Supabase project is used by CI.

## Known limitations

- Invitation email delivery, Supabase Auth URL configuration, and migration application remain deployment configuration responsibilities.
- Last-sign-in data is displayed from Supabase Auth when available; it may be empty for a new invitation.
- Existing sessions are denied on the next protected server request after disablement; already-rendered browser HTML is not forcibly erased.
- No audit-log viewer or export is exposed beyond the per-user recent history panel.
