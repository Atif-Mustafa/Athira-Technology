# Admin content management

The Athira Technology CMS stores public pages, blog posts, services, and informational pricing plans in Supabase PostgreSQL. It uses the existing Supabase SSR session and application roles; it does not introduce a second identity system, a page builder, uploads, billing, analytics, or arbitrary HTML.

Runtime PostgreSQL and real Preview acceptance remain owner-run steps. Never paste Supabase keys, sessions, invitation links, or database credentials into an issue, screenshot, test report, or chat.

## Architecture

| Area | Database source | Public visibility | Admin route |
| --- | --- | --- | --- |
| Limited marketing pages | `public.pages` | `published` and `published_at <= now()` | `/admin/content/pages` |
| Blog | `public.posts` | `published` and `published_at <= now()` | `/admin/blog` |
| Services | `public.services` | `active = true` | `/admin/services` |
| Pricing | `public.pricing_plans` | `active = true` | `/admin/pricing` |
| Revisions | `public.content_revisions` | Never public | CMS detail screens |

Public reads use a stateless Supabase client with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and anonymous RLS. They never use `SUPABASE_SECRET_KEY`. CMS reads use the signed-in user's cookie session and RLS. CMS writes use authenticated RPC functions; the service-role client remains limited to administrative Auth operations such as invitations.

The database mutation functions perform authorization, optimistic version checks, the content write, actor attribution, and revision insertion in one transaction. Server Actions repeat authentication, active-profile, role, and input checks before invoking those functions.

## Role permissions

| Capability | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| Read CMS records and history | Yes | Yes | Yes |
| Create and edit | Yes | Yes | No |
| Publish/unpublish | Yes | Yes | No |
| Activate/deactivate services or pricing | Yes | Yes | No |
| Archive or restore pages/posts | Yes | No | No |
| Private preview | Yes | Yes | No |
| Hard delete | Not implemented | Not implemented | No |

Every request re-reads the authenticated user, profile status, and role. A disabled profile is denied on the next server authorization check. Hiding controls in the browser is only a UX measure; Server Actions and PostgreSQL functions enforce the matrix independently.

## Database migration

Execution order is:

1. `supabase/migrations/20260814000000_admin_auth_rbac.sql`
2. `supabase/migrations/20260817100000_admin_user_management.sql`
3. `supabase/migrations/20260819090000_cms.sql`

The CMS migration is additive. Do not edit or rerun previous migration files as replacement SQL.

The CMS migration creates:

- `public.cms_content_status`
- `public.pages`
- `public.posts`
- `public.services`
- `public.pricing_plans`
- `public.content_revisions`
- `public.cms_actor_has_any_role(...)`
- `public.cms_user_display_name(...)`
- `public.cms_save_page(...)`
- `public.cms_save_post(...)`
- `public.cms_save_service(...)`
- `public.cms_save_pricing_plan(...)`

All content tables and revisions have RLS enabled. Anonymous column grants omit actor UUIDs. No content table grants anonymous or authenticated users direct insert, update, or delete privileges. Mutation functions are `SECURITY DEFINER`, use `search_path = pg_catalog`, are executable only by `authenticated`, and verify an active editor/admin inside PostgreSQL.

## Initial content seed

After the CMS migration succeeds, run `supabase/seed.sql` once in the same Preview project. It requires at least one active admin so seeded rows have a real actor. It preserves the existing three blog articles, eight services, and three informational pricing plans.

The seed is idempotent:

- `ON CONFLICT (slug) DO NOTHING` prevents duplicates.
- A rerun does not overwrite CMS edits.
- Initial revision rows are added only when an entity has no revision.

If the seed reports that no active administrator exists, stop. Complete the Auth/RBAC owner setup first; do not invent or directly insert an actor UUID.

## Content lifecycle

Pages and posts use `draft`, `published`, and `archived`.

- Drafts are CMS-only.
- Publishing sets server-generated `published_at` and `published_by`.
- Unpublishing returns content to draft and removes it from anonymous reads.
- Archiving is admin-only and is the deletion policy for this milestone.
- Restoring an archived record creates a draft.

Services and pricing plans use active/inactive visibility. Inactive records remain available to authorized CMS readers and are absent from anonymous reads.

Every successful create, update, publish, unpublish, archive, restore, activate, or deactivate writes a `content_revisions` row. Snapshots are bounded by database content limits and a 100 KB JSON constraint. Tokens, cookies, credentials, headers, passwords, and invitation links are never part of content snapshots.

## Optimistic concurrency

Every entity begins at version 1. Forms submit the version that was loaded. PostgreSQL locks the target row and compares that submitted value with the current value before updating.

If another editor has already saved a newer version, the mutation raises `cms_conflict` and the UI displays:

> This content changed since you opened it. Reload before saving.

No last-write-wins fallback is used.

## Slugs and links

Slugs are normalized to lowercase ASCII, hyphen-separated, and bounded to 80 characters. The generic page route rejects framework and existing marketing routes including `admin`, `api`, `_next`, `robots.txt`, `sitemap.xml`, `services`, `pricing`, `blog`, `contact`, `privacy`, and `terms`.

Pricing CTAs accept internal paths only. Protocol URLs, scheme-relative paths, backslashes, and control characters are rejected. Billing, checkout, subscriptions, and entitlement behavior are not implemented.

## Content rendering and XSS controls

Body content uses a deliberately small Markdown subset:

- level-two and level-three headings
- paragraphs
- unordered lists
- fenced code blocks

Raw HTML, Markdown HTML, embedded media, and arbitrary components are not interpreted. React renders all body text through ordinary escaped text nodes. CMS bodies never enter `dangerouslySetInnerHTML`. JSON-LD continues to serialize structured objects and escapes `<` before insertion into the script node.

## Preview

Private previews are:

- `/admin/preview/post/[id]`
- `/admin/preview/page/[id]`

They require an active admin or editor session, query through authenticated RLS, inherit admin `noindex`, and never appear in the sitemap. There are no public preview tokens.

## Cache invalidation

The application does not enable Next.js Cache Components, so public Supabase queries use `unstable_cache` with one-hour fallback revalidation and entity-specific tags:

- `cms:pages`
- `cms:posts`
- `cms:services`
- `cms:pricing`

Server Actions call `updateTag` for immediate read-your-own-writes and revalidate only affected paths. A post change revalidates `/blog`, its detail path, and the sitemap. Services and pricing revalidate their public route and homepage teaser. Pages revalidate their canonical path and sitemap.

## Transition fallback

When Supabase public environment values are absent, local builds and deterministic CI tests use typed static blog, service, and pricing content. This is a transition fallback, not a production database-error fallback.

Once Supabase is configured, PostgreSQL is authoritative. Query failures are surfaced on public routes rather than silently serving stale static data indefinitely. The sitemap catches a CMS query failure and returns only known fixed routes so it cannot emit malformed database entries.

## SEO and discovery

- Published posts generate metadata from `seo_title` / `seo_description`, falling back to title/excerpt.
- Generic published pages use their safe canonical path and SEO fields.
- Blog JSON-LD uses `BlogPosting` with actual title, author label, publication date, modified date, description, and canonical detail URL.
- Drafts and archived records return 404 to anonymous users.
- Admin and preview routes are `noindex`.
- Sitemap generation includes only published posts and pages plus the existing fixed public routes.
- Canonical origins continue to use the environment-aware site configuration; deployed builds must not configure localhost.

## Vercel environment

The CMS introduces no new secret. Preview and Production still require:

| Variable | Classification |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public |
| `SUPABASE_SECRET_KEY` | Server only / secret; Auth administration only |
| `NEXT_PUBLIC_SITE_URL` | Public canonical origin; optional (falls back to Vercel's automatic `VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL`) |

Never prefix `SUPABASE_SECRET_KEY` with `NEXT_PUBLIC_`. Never paste values into chat. A new Vercel deployment is required after changing environment values.

## Read-only runtime verification SQL

Run this in the Preview Supabase SQL editor after applying the migration. It reads schema metadata only.

```sql
select version, name
from supabase_migrations.schema_migrations
where version in ('20260814000000', '20260817100000', '20260819090000')
order by version;

select n.nspname as schema_name, c.relname, c.relrowsecurity
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('pages', 'posts', 'services', 'pricing_plans', 'content_revisions')
order by c.relname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('pages', 'posts', 'services', 'pricing_plans', 'content_revisions')
order by tablename, policyname;

select routine_name, security_type, routine_definition
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'cms_actor_has_any_role',
    'cms_user_display_name',
    'cms_save_page',
    'cms_save_post',
    'cms_save_service',
    'cms_save_pricing_plan'
  )
order by routine_name;

select
  has_table_privilege('anon', 'public.content_revisions', 'select') as anon_revision_read,
  has_table_privilege('anon', 'public.posts', 'insert') as anon_post_insert,
  has_table_privilege('authenticated', 'public.posts', 'update') as authenticated_direct_post_update,
  has_function_privilege('anon', 'public.cms_save_post(uuid, integer, text, text, text, text, public.cms_content_status, text, text, text, text, text)', 'execute') as anon_post_rpc,
  has_function_privilege('authenticated', 'public.cms_save_post(uuid, integer, text, text, text, text, public.cms_content_status, text, text, text, text, text)', 'execute') as authenticated_post_rpc;
```

Expected privilege booleans are `false`, `false`, `false`, `false`, `true`. The final `true` exposes the RPC endpoint to signed-in sessions; the function still rejects viewer, disabled, missing-role, and unauthenticated actors internally.

## Real Preview acceptance checklist

Use controlled Admin, Editor, and Viewer accounts. Do not use customer accounts or mutate Production data.

1. Confirm the Auth/RBAC and user-management migrations are already applied.
2. Apply `20260819090000_cms.sql` to the Preview project only.
3. Run the read-only verification SQL above.
4. Confirm at least one active admin exists.
5. Apply `supabase/seed.sql` once.
6. Verify 3 posts, 8 services, and 3 pricing plans exist; do not expose row content in reports.
7. Redeploy Preview after confirming Vercel environment values.
8. Log in as Admin and open `/admin/content`.
9. Confirm database-backed counts match Preview rows.
10. Create a controlled draft blog post with a unique test slug.
11. Confirm its public detail route returns 404 and it is absent from `/sitemap.xml`.
12. Open its authenticated preview; confirm anonymous access redirects to login.
13. Publish it and confirm the public route, metadata, JSON-LD, and sitemap entry.
14. Edit it and confirm the public content updates without a global purge.
15. Open the same version in two sessions, save one, and confirm the other receives the conflict message.
16. Archive it as Admin and confirm its public route returns 404 and sitemap entry disappears.
17. Restore it as draft and confirm it remains private.
18. Edit a controlled service and confirm `/services` and the homepage teaser.
19. Edit a controlled pricing plan and confirm `/pricing`, homepage teaser, and CTA path.
20. Log in as Editor; confirm create, edit, publish, unpublish, activate, and deactivate work.
21. Confirm Editor cannot archive or restore pages/posts by UI or direct request.
22. Log in as Viewer; confirm lists and details are readable, controls are disabled, and previews are forbidden.
23. Attempt a Viewer mutation by direct request and confirm server/database denial.
24. Disable a controlled Editor with an existing session and confirm the next mutation is denied.
25. Inspect `content_revisions` for correct actor, entity, action, timestamps, versions, and snapshots; confirm no secrets or session data.

After content checks, repeat public-site, contact delivery, rate-limit, admin login, user-management, logout, responsive, keyboard, and axe acceptance. Runtime results must be reported separately from static SQL verification.

## Known limitations

- No media library or image uploads.
- No arbitrary HTML, embeds, drag/drop, component composition, or WYSIWYG editor.
- No scheduled publishing UI; the database visibility rule supports only publication timestamps produced by the server workflow.
- No hard-delete UI or revision restore-to-version operation.
- No revision retention job; snapshots are bounded per row, but long-term retention policy remains an owner decision.
- No multilingual or multi-tenant content.
- Static fallback remains for unconfigured local/CI environments and should be removed after every deployed environment has completed CMS migration and seed acceptance.
