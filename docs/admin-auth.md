# Admin authentication and RBAC

This milestone connects the existing Admin UX concept to Supabase Auth and a small database-backed authorization foundation. It does not implement user-management CRUD, CMS CRUD, contact-enquiry management, analytics, billing, or AI execution.

## Architecture

- Supabase Auth is the identity and password source of truth.
- `@supabase/ssr` stores the authenticated session in cookies for App Router server rendering.
- `proxy.ts` refreshes Supabase sessions for `/admin/**` requests using the Next.js 16 Proxy convention.
- `src/server/auth/guards.ts` performs fresh server-side identity and role lookups before dashboard rendering.
- The dashboard allows `admin`, `editor`, and `viewer` roles to read the current baseline concept. Future mutations will require narrower role guards.
- No privileged service-role client is used in this milestone. Ordinary authenticated reads use the user session and RLS.

The implementation deliberately does not add a Custom Access Token Hook yet. Role claims would require an additional Supabase Dashboard hook deployment and claim-refresh lifecycle. Fresh server-side role lookup is easier to verify during this foundation milestone, while the database helper and RLS model leave a clean path to trusted JWT claims later.

## Environment

Set these public variables in local development, Vercel Preview, and Vercel Production as appropriate:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

They are public browser configuration, not credentials. Do not commit real values. No server-only Supabase secret is required yet. If a future trusted bootstrap or administrative operation requires a service-role key, it must remain server-only, use a non-`NEXT_PUBLIC_` name, and never enter client props, responses, logs, or source maps.

Marketing pages do not require Supabase configuration. `/admin/login` shows a safe configuration-unavailable state when the variables are absent, and protected routes redirect to that boundary rather than rendering dashboard content.

## Database migration

Apply `supabase/migrations/20260814000000_admin_auth_rbac.sql` to the project using the Supabase CLI or SQL migration workflow. It creates:

- `public.profiles`, linked to `auth.users` with cascade deletion.
- `public.user_roles`, backed by the `admin`, `editor`, and `viewer` enum.
- An idempotent `auth.users` trigger that creates a profile and least-privilege `viewer` role.
- `public.has_app_role`, a restricted security-definer helper with an explicit `search_path`.
- RLS policies that permit users to read their own profile/role rows, let admins read other profiles/roles, and prevent self-role mutation.

The trigger never assigns `admin` automatically. Re-running the profile/role trigger for an existing identity is safe.

## First-admin bootstrap

1. Create a free Supabase project.
2. Apply the migration.
3. In Supabase Authentication, create the first user manually. Disable the project setting that allows new users to sign up. Hiding the signup UI is not sufficient: if Supabase public signup remains enabled, anyone who discovers the project URL can create an authenticated `viewer` account and reach the baseline dashboard. Do not enable or expose public signup for this internal application.
4. In the Supabase SQL editor, run a controlled owner action using the created user UUID:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('USER_UUID_FROM_SUPABASE_AUTH', 'admin')
   on conflict (user_id, role) do nothing;
   ```

5. Add the two public environment variables to the Vercel Preview environment and redeploy.
6. Open `/admin/login`, sign in, verify the displayed role, and test logout.

Replace the placeholder UUID only in the owner-controlled SQL editor. Never put it in a public URL, form, or application secret. A new user starts as `viewer`; no user becomes an admin by being first.

## Route behavior

- `/admin/login` is public, has email/password sign-in, no signup, and uses generic invalid-credential messaging.
- `/admin/dashboard` performs server-side auth and role checks. Anonymous requests redirect to `/admin/login?next=/admin/dashboard`.
- Authenticated users with no active valid role, disabled profiles, or failed role lookup redirect to `/admin/forbidden`.
- `admin`, `editor`, and `viewer` can read the current dashboard concept. Planned navigation items remain non-functional.
- Logout calls Supabase server-side sign-out and redirects to `/admin/login?logged_out=1`.

## Vercel Preview setup

1. In the Vercel project, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the Preview environment only.
2. In Supabase Auth URL configuration, add the exact Vercel Preview URL that will host the app. Avoid wildcard redirects.
3. Keep the existing preview noindex behavior and do not infer production-domain settings from a preview deployment.
4. Redeploy after changing environment variables.
5. Confirm logged-out redirect, login, role display, logout, and public-page access in the preview.

## Known limitations

- No public signup, invitation, password reset, or user-management UI exists.
- No CMS, contact-enquiry management, analytics backend, billing, or AI execution exists.
- Role assignment is an owner-controlled SQL/bootstrap operation until a later secured admin mutation milestone.
- Authenticated integration tests in this repository use deterministic local mocks and pure decision tests; they do not claim a live Supabase project has been verified.
- Supabase Dashboard Auth URL configuration, migration application, owner bootstrap, and Vercel environment setup remain manual acceptance work.
