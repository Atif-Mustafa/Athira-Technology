-- Supabase-backed content management.
--
-- Public content is readable with the publishable key under RLS. Administrative
-- reads use the authenticated user's session. All writes go through the guarded
-- functions below so authorization, optimistic locking, attribution, lifecycle
-- transitions, and revisions are committed atomically.

create type public.cms_content_status as enum ('draft', 'published', 'archived');

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  status public.cms_content_status not null default 'draft',
  seo_title text,
  seo_description text,
  canonical_path text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  published_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  version integer not null default 1,
  constraint pages_slug_format check (
    char_length(slug) between 1 and 80
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug <> all (array[
      'admin', 'api', '_next', 'robots.txt', 'sitemap.xml',
      'ai-software-engineer', 'agents', 'services', 'pricing', 'blog',
      'contact', 'privacy', 'terms'
    ])
  ),
  constraint pages_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint pages_summary_length check (char_length(summary) <= 500),
  constraint pages_body_length check (char_length(body) <= 50000),
  constraint pages_seo_title_length check (seo_title is null or char_length(seo_title) <= 70),
  constraint pages_seo_description_length check (seo_description is null or char_length(seo_description) <= 170),
  constraint pages_canonical_path_safe check (
    char_length(canonical_path) between 1 and 200
    and canonical_path ~ '^/[a-z0-9/_-]*$'
    and canonical_path !~ '^//'
    and canonical_path !~ '^/(?:admin|api|_next)(?:/|$)'
  ),
  constraint pages_canonical_matches_slug check (canonical_path = '/' || slug),
  constraint pages_version_positive check (version >= 1),
  constraint pages_published_timestamp check (status <> 'published' or published_at is not null)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  status public.cms_content_status not null default 'draft',
  author_name text not null,
  author_id uuid references auth.users(id) on delete set null,
  category text not null default 'Insights',
  reading_time text not null default '5 min read',
  seo_title text,
  seo_description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  published_by uuid references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  constraint posts_slug_format check (
    char_length(slug) between 1 and 80
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug <> all (array['admin', 'api', '_next', 'robots.txt', 'sitemap.xml'])
  ),
  constraint posts_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint posts_excerpt_length check (char_length(excerpt) between 1 and 500),
  constraint posts_body_length check (char_length(body) between 1 and 50000),
  constraint posts_author_name_length check (char_length(btrim(author_name)) between 1 and 120),
  constraint posts_category_length check (char_length(btrim(category)) between 1 and 80),
  constraint posts_reading_time_length check (char_length(btrim(reading_time)) between 1 and 40),
  constraint posts_seo_title_length check (seo_title is null or char_length(seo_title) <= 70),
  constraint posts_seo_description_length check (seo_description is null or char_length(seo_description) <= 170),
  constraint posts_version_positive check (version >= 1),
  constraint posts_published_timestamp check (status <> 'published' or published_at is not null)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null default '',
  business_problem text not null default '',
  scope text not null default '',
  deliverables text[] not null default '{}',
  engagement_model text not null default '',
  icon text not null default 'strategy',
  sort_order integer not null default 0,
  active boolean not null default false,
  seo_title text,
  seo_description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  constraint services_slug_format check (
    char_length(slug) between 1 and 80
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug <> all (array['admin', 'api', '_next', 'robots.txt', 'sitemap.xml'])
  ),
  constraint services_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint services_summary_length check (char_length(summary) between 1 and 500),
  constraint services_description_length check (char_length(description) <= 10000),
  constraint services_business_problem_length check (char_length(business_problem) <= 2000),
  constraint services_scope_length check (char_length(scope) <= 2000),
  constraint services_deliverables_length check (
    cardinality(deliverables) <= 20 and char_length(array_to_string(deliverables, '')) <= 4000
  ),
  constraint services_engagement_model_length check (char_length(engagement_model) <= 2000),
  constraint services_icon_allowed check (icon in (
    'strategy', 'agents', 'automation', 'integration', 'modernization',
    'cloud', 'quality', 'consulting'
  )),
  constraint services_sort_order_bounds check (sort_order between -10000 and 10000),
  constraint services_seo_title_length check (seo_title is null or char_length(seo_title) <= 70),
  constraint services_seo_description_length check (seo_description is null or char_length(seo_description) <= 170),
  constraint services_version_positive check (version >= 1)
);

create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  label text not null,
  target_user text not null default '',
  description text not null,
  features text[] not null default '{}',
  limitations text[] not null default '{}',
  cta_label text not null,
  cta_href text not null default '/contact',
  featured boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  constraint pricing_plans_slug_format check (
    char_length(slug) between 1 and 80
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug <> all (array['admin', 'api', '_next', 'robots.txt', 'sitemap.xml'])
  ),
  constraint pricing_plans_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint pricing_plans_label_length check (char_length(btrim(label)) between 1 and 100),
  constraint pricing_plans_target_user_length check (char_length(target_user) <= 300),
  constraint pricing_plans_description_length check (char_length(description) between 1 and 2000),
  constraint pricing_plans_features_length check (
    cardinality(features) <= 30 and char_length(array_to_string(features, '')) <= 5000
  ),
  constraint pricing_plans_limitations_length check (
    cardinality(limitations) <= 30 and char_length(array_to_string(limitations, '')) <= 5000
  ),
  constraint pricing_plans_cta_label_length check (char_length(btrim(cta_label)) between 1 and 100),
  constraint pricing_plans_cta_href_safe check (
    char_length(cta_href) between 1 and 300
    and cta_href ~ '^/[A-Za-z0-9/_?&=%#.-]*$'
    and cta_href !~ '^//'
    and position(E'\\\\' in cta_href) = 0
    and cta_href !~ '[[:cntrl:]]'
  ),
  constraint pricing_plans_sort_order_bounds check (sort_order between -10000 and 10000),
  constraint pricing_plans_version_positive check (version >= 1)
);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('pages', 'posts', 'services', 'pricing_plans')),
  entity_id uuid not null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('CREATED', 'UPDATED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED', 'RESTORED')),
  previous_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint content_revisions_previous_size check (
    previous_data is null or octet_length(previous_data::text) <= 100000
  ),
  constraint content_revisions_new_size check (
    new_data is null or octet_length(new_data::text) <= 100000
  )
);

create index pages_publication_idx on public.pages (status, published_at desc);
create index posts_publication_idx on public.posts (status, published_at desc);
create index services_public_order_idx on public.services (active, sort_order, title);
create index pricing_plans_public_order_idx on public.pricing_plans (active, sort_order, name);
create index content_revisions_entity_created_idx
  on public.content_revisions (entity_type, entity_id, created_at desc);

comment on table public.pages is 'Limited CMS-managed marketing pages exposed only through safe, non-reserved slugs.';
comment on table public.posts is 'CMS-managed blog posts with draft, published, and archived lifecycle states.';
comment on table public.services is 'CMS-managed public service content; inactive rows are private.';
comment on table public.pricing_plans is 'Informational marketing plans only; no billing or entitlement data.';
comment on table public.content_revisions is 'Bounded CMS snapshots created atomically by guarded mutation functions.';

create or replace function public.cms_actor_has_any_role(
  required_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.user_roles as user_role
    join public.profiles as profile on profile.id = user_role.user_id
    where user_role.user_id = (select auth.uid())
      and user_role.role = any(required_roles)
      and profile.status = 'active'
  );
$$;

create or replace function public.cms_user_display_name(target_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := auth.uid();
  result text;
begin
  if actor is null or not public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ) then
    raise exception 'cms_forbidden' using errcode = '42501';
  end if;

  if not (
    exists (select 1 from public.pages as content_page where target_user_id in (content_page.created_by, content_page.updated_by, content_page.published_by))
    or exists (select 1 from public.posts as content_post where target_user_id in (content_post.created_by, content_post.updated_by, content_post.published_by))
    or exists (select 1 from public.services as content_service where target_user_id in (content_service.created_by, content_service.updated_by))
    or exists (select 1 from public.pricing_plans as content_plan where target_user_id in (content_plan.created_by, content_plan.updated_by))
    or exists (select 1 from public.content_revisions as revision where revision.actor_user_id = target_user_id)
  ) then
    return 'Workspace user';
  end if;

  select nullif(btrim(profile.display_name), '')
  into result
  from public.profiles as profile
  where profile.id = target_user_id;

  return coalesce(result, 'Workspace user');
end;
$$;

revoke all on function public.cms_actor_has_any_role(public.app_role[]) from public, anon;
revoke all on function public.cms_user_display_name(uuid) from public, anon;
grant execute on function public.cms_actor_has_any_role(public.app_role[]) to authenticated;
grant execute on function public.cms_user_display_name(uuid) to authenticated;

alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.services enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.content_revisions enable row level security;

revoke all on public.pages from public, anon, authenticated;
revoke all on public.posts from public, anon, authenticated;
revoke all on public.services from public, anon, authenticated;
revoke all on public.pricing_plans from public, anon, authenticated;
revoke all on public.content_revisions from public, anon, authenticated;

grant select (id, slug, title, summary, body, status, seo_title, seo_description, canonical_path, created_at, updated_at, published_at, version) on public.pages to anon;
grant select (id, slug, title, excerpt, body, status, author_name, category, reading_time, seo_title, seo_description, published_at, created_at, updated_at, version) on public.posts to anon;
grant select (id, slug, title, summary, description, business_problem, scope, deliverables, engagement_model, icon, sort_order, active, seo_title, seo_description, created_at, updated_at, version) on public.services to anon;
grant select (id, name, slug, label, target_user, description, features, limitations, cta_label, cta_href, featured, sort_order, active, created_at, updated_at, version) on public.pricing_plans to anon;

grant select on public.pages to authenticated;
grant select on public.posts to authenticated;
grant select on public.services to authenticated;
grant select on public.pricing_plans to authenticated;
grant select on public.content_revisions to authenticated;

create policy pages_public_read
  on public.pages for select to anon
  using (status = 'published' and published_at <= timezone('utc', now()));

create policy pages_cms_read
  on public.pages for select to authenticated
  using (public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ));

create policy posts_public_read
  on public.posts for select to anon
  using (status = 'published' and published_at <= timezone('utc', now()));

create policy posts_cms_read
  on public.posts for select to authenticated
  using (public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ));

create policy services_public_read
  on public.services for select to anon
  using (active = true);

create policy services_cms_read
  on public.services for select to authenticated
  using (public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ));

create policy pricing_plans_public_read
  on public.pricing_plans for select to anon
  using (active = true);

create policy pricing_plans_cms_read
  on public.pricing_plans for select to authenticated
  using (public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ));

create policy content_revisions_cms_read
  on public.content_revisions for select to authenticated
  using (public.cms_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  ));

create or replace function public.cms_save_page(
  target_id uuid,
  expected_version integer,
  new_slug text,
  new_title text,
  new_summary text,
  new_body text,
  new_status public.cms_content_status,
  new_seo_title text,
  new_seo_description text,
  new_canonical_path text
)
returns table(entity_id uuid, entity_version integer)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := auth.uid();
  previous_row public.pages%rowtype;
  current_row public.pages%rowtype;
  revision_action text;
begin
  if actor is null or not public.cms_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then
    raise exception 'cms_forbidden' using errcode = '42501';
  end if;

  if new_status = 'archived'
    and not public.cms_actor_has_any_role(array['admin']::public.app_role[]) then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;

  if target_id is null then
    if expected_version is distinct from 0 then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    insert into public.pages (
      slug, title, summary, body, status, seo_title, seo_description,
      canonical_path, created_by, updated_by, published_by, published_at
    ) values (
      new_slug, new_title, new_summary, new_body, new_status,
      nullif(new_seo_title, ''), nullif(new_seo_description, ''),
      new_canonical_path, actor, actor,
      case when new_status = 'published' then actor else null end,
      case when new_status = 'published' then timezone('utc', now()) else null end
    ) returning * into current_row;

    revision_action := 'CREATED';
  else
    select * into previous_row from public.pages where id = target_id for update;
    if not found then raise exception 'cms_not_found' using errcode = 'P0002'; end if;
    if previous_row.version is distinct from expected_version then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;
    if previous_row.status = 'archived'
      and not public.cms_actor_has_any_role(array['admin']::public.app_role[]) then
      raise exception 'cms_admin_required' using errcode = '42501';
    end if;

    update public.pages set
      slug = new_slug,
      title = new_title,
      summary = new_summary,
      body = new_body,
      status = new_status,
      seo_title = nullif(new_seo_title, ''),
      seo_description = nullif(new_seo_description, ''),
      canonical_path = new_canonical_path,
      updated_by = actor,
      updated_at = timezone('utc', now()),
      published_by = case
        when new_status = 'published' and previous_row.status <> 'published' then actor
        when new_status = 'published' then previous_row.published_by
        else null
      end,
      published_at = case
        when new_status = 'published' and previous_row.status <> 'published' then timezone('utc', now())
        when new_status = 'published' then previous_row.published_at
        else null
      end,
      version = previous_row.version + 1
    where id = target_id
    returning * into current_row;

    revision_action := case
      when previous_row.status <> 'published' and current_row.status = 'published' then 'PUBLISHED'
      when previous_row.status = 'published' and current_row.status = 'draft' then 'UNPUBLISHED'
      when previous_row.status <> 'archived' and current_row.status = 'archived' then 'ARCHIVED'
      when previous_row.status = 'archived' and current_row.status <> 'archived' then 'RESTORED'
      else 'UPDATED'
    end;
  end if;

  insert into public.content_revisions (
    entity_type, entity_id, actor_user_id, action, previous_data, new_data
  ) values (
    'pages', current_row.id, actor, revision_action,
    case when target_id is null then null else to_jsonb(previous_row) end,
    to_jsonb(current_row)
  );

  return query select current_row.id, current_row.version;
end;
$$;

create or replace function public.cms_save_post(
  target_id uuid,
  expected_version integer,
  new_slug text,
  new_title text,
  new_excerpt text,
  new_body text,
  new_status public.cms_content_status,
  new_author_name text,
  new_category text,
  new_reading_time text,
  new_seo_title text,
  new_seo_description text
)
returns table(entity_id uuid, entity_version integer)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := auth.uid();
  previous_row public.posts%rowtype;
  current_row public.posts%rowtype;
  revision_action text;
begin
  if actor is null or not public.cms_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then
    raise exception 'cms_forbidden' using errcode = '42501';
  end if;

  if new_status = 'archived'
    and not public.cms_actor_has_any_role(array['admin']::public.app_role[]) then
    raise exception 'cms_admin_required' using errcode = '42501';
  end if;

  if target_id is null then
    if expected_version is distinct from 0 then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    insert into public.posts (
      slug, title, excerpt, body, status, author_name, author_id, category,
      reading_time, seo_title, seo_description, created_by, updated_by,
      published_by, published_at
    ) values (
      new_slug, new_title, new_excerpt, new_body, new_status, new_author_name,
      actor, new_category, new_reading_time, nullif(new_seo_title, ''),
      nullif(new_seo_description, ''), actor, actor,
      case when new_status = 'published' then actor else null end,
      case when new_status = 'published' then timezone('utc', now()) else null end
    ) returning * into current_row;

    revision_action := 'CREATED';
  else
    select * into previous_row from public.posts where id = target_id for update;
    if not found then raise exception 'cms_not_found' using errcode = 'P0002'; end if;
    if previous_row.version is distinct from expected_version then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;
    if previous_row.status = 'archived'
      and not public.cms_actor_has_any_role(array['admin']::public.app_role[]) then
      raise exception 'cms_admin_required' using errcode = '42501';
    end if;

    update public.posts set
      slug = new_slug,
      title = new_title,
      excerpt = new_excerpt,
      body = new_body,
      status = new_status,
      author_name = new_author_name,
      category = new_category,
      reading_time = new_reading_time,
      seo_title = nullif(new_seo_title, ''),
      seo_description = nullif(new_seo_description, ''),
      updated_by = actor,
      updated_at = timezone('utc', now()),
      published_by = case
        when new_status = 'published' and previous_row.status <> 'published' then actor
        when new_status = 'published' then previous_row.published_by
        else null
      end,
      published_at = case
        when new_status = 'published' and previous_row.status <> 'published' then timezone('utc', now())
        when new_status = 'published' then previous_row.published_at
        else null
      end,
      version = previous_row.version + 1
    where id = target_id
    returning * into current_row;

    revision_action := case
      when previous_row.status <> 'published' and current_row.status = 'published' then 'PUBLISHED'
      when previous_row.status = 'published' and current_row.status = 'draft' then 'UNPUBLISHED'
      when previous_row.status <> 'archived' and current_row.status = 'archived' then 'ARCHIVED'
      when previous_row.status = 'archived' and current_row.status <> 'archived' then 'RESTORED'
      else 'UPDATED'
    end;
  end if;

  insert into public.content_revisions (
    entity_type, entity_id, actor_user_id, action, previous_data, new_data
  ) values (
    'posts', current_row.id, actor, revision_action,
    case when target_id is null then null else to_jsonb(previous_row) end,
    to_jsonb(current_row)
  );

  return query select current_row.id, current_row.version;
end;
$$;

create or replace function public.cms_save_service(
  target_id uuid,
  expected_version integer,
  new_slug text,
  new_title text,
  new_summary text,
  new_description text,
  new_business_problem text,
  new_scope text,
  new_deliverables text[],
  new_engagement_model text,
  new_icon text,
  new_sort_order integer,
  new_active boolean,
  new_seo_title text,
  new_seo_description text
)
returns table(entity_id uuid, entity_version integer)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := auth.uid();
  previous_row public.services%rowtype;
  current_row public.services%rowtype;
  revision_action text;
begin
  if actor is null or not public.cms_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then
    raise exception 'cms_forbidden' using errcode = '42501';
  end if;

  if target_id is null then
    if expected_version is distinct from 0 then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    insert into public.services (
      slug, title, summary, description, business_problem, scope, deliverables,
      engagement_model, icon, sort_order, active, seo_title, seo_description,
      created_by, updated_by
    ) values (
      new_slug, new_title, new_summary, new_description, new_business_problem,
      new_scope, new_deliverables, new_engagement_model, new_icon, new_sort_order,
      new_active, nullif(new_seo_title, ''), nullif(new_seo_description, ''),
      actor, actor
    ) returning * into current_row;

    revision_action := 'CREATED';
  else
    select * into previous_row from public.services where id = target_id for update;
    if not found then raise exception 'cms_not_found' using errcode = 'P0002'; end if;
    if previous_row.version is distinct from expected_version then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    update public.services set
      slug = new_slug,
      title = new_title,
      summary = new_summary,
      description = new_description,
      business_problem = new_business_problem,
      scope = new_scope,
      deliverables = new_deliverables,
      engagement_model = new_engagement_model,
      icon = new_icon,
      sort_order = new_sort_order,
      active = new_active,
      seo_title = nullif(new_seo_title, ''),
      seo_description = nullif(new_seo_description, ''),
      updated_by = actor,
      updated_at = timezone('utc', now()),
      version = previous_row.version + 1
    where id = target_id
    returning * into current_row;

    revision_action := case
      when previous_row.active = false and current_row.active = true then 'PUBLISHED'
      when previous_row.active = true and current_row.active = false then 'UNPUBLISHED'
      else 'UPDATED'
    end;
  end if;

  insert into public.content_revisions (
    entity_type, entity_id, actor_user_id, action, previous_data, new_data
  ) values (
    'services', current_row.id, actor, revision_action,
    case when target_id is null then null else to_jsonb(previous_row) end,
    to_jsonb(current_row)
  );

  return query select current_row.id, current_row.version;
end;
$$;

create or replace function public.cms_save_pricing_plan(
  target_id uuid,
  expected_version integer,
  new_name text,
  new_slug text,
  new_label text,
  new_target_user text,
  new_description text,
  new_features text[],
  new_limitations text[],
  new_cta_label text,
  new_cta_href text,
  new_featured boolean,
  new_sort_order integer,
  new_active boolean
)
returns table(entity_id uuid, entity_version integer)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  actor uuid := auth.uid();
  previous_row public.pricing_plans%rowtype;
  current_row public.pricing_plans%rowtype;
  revision_action text;
begin
  if actor is null or not public.cms_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then
    raise exception 'cms_forbidden' using errcode = '42501';
  end if;

  if target_id is null then
    if expected_version is distinct from 0 then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    insert into public.pricing_plans (
      name, slug, label, target_user, description, features, limitations,
      cta_label, cta_href, featured, sort_order, active, created_by, updated_by
    ) values (
      new_name, new_slug, new_label, new_target_user, new_description,
      new_features, new_limitations, new_cta_label, new_cta_href, new_featured,
      new_sort_order, new_active, actor, actor
    ) returning * into current_row;

    revision_action := 'CREATED';
  else
    select * into previous_row from public.pricing_plans where id = target_id for update;
    if not found then raise exception 'cms_not_found' using errcode = 'P0002'; end if;
    if previous_row.version is distinct from expected_version then
      raise exception 'cms_conflict' using errcode = '40001';
    end if;

    update public.pricing_plans set
      name = new_name,
      slug = new_slug,
      label = new_label,
      target_user = new_target_user,
      description = new_description,
      features = new_features,
      limitations = new_limitations,
      cta_label = new_cta_label,
      cta_href = new_cta_href,
      featured = new_featured,
      sort_order = new_sort_order,
      active = new_active,
      updated_by = actor,
      updated_at = timezone('utc', now()),
      version = previous_row.version + 1
    where id = target_id
    returning * into current_row;

    revision_action := case
      when previous_row.active = false and current_row.active = true then 'PUBLISHED'
      when previous_row.active = true and current_row.active = false then 'UNPUBLISHED'
      else 'UPDATED'
    end;
  end if;

  insert into public.content_revisions (
    entity_type, entity_id, actor_user_id, action, previous_data, new_data
  ) values (
    'pricing_plans', current_row.id, actor, revision_action,
    case when target_id is null then null else to_jsonb(previous_row) end,
    to_jsonb(current_row)
  );

  return query select current_row.id, current_row.version;
end;
$$;

revoke all on function public.cms_save_page(
  uuid, integer, text, text, text, text, public.cms_content_status, text, text, text
) from public, anon, service_role;
revoke all on function public.cms_save_post(
  uuid, integer, text, text, text, text, public.cms_content_status, text, text, text, text, text
) from public, anon, service_role;
revoke all on function public.cms_save_service(
  uuid, integer, text, text, text, text, text, text, text[], text, text, integer, boolean, text, text
) from public, anon, service_role;
revoke all on function public.cms_save_pricing_plan(
  uuid, integer, text, text, text, text, text, text[], text[], text, text, boolean, integer, boolean
) from public, anon, service_role;

grant execute on function public.cms_save_page(
  uuid, integer, text, text, text, text, public.cms_content_status, text, text, text
) to authenticated;
grant execute on function public.cms_save_post(
  uuid, integer, text, text, text, text, public.cms_content_status, text, text, text, text, text
) to authenticated;
grant execute on function public.cms_save_service(
  uuid, integer, text, text, text, text, text, text, text[], text, text, integer, boolean, text, text
) to authenticated;
grant execute on function public.cms_save_pricing_plan(
  uuid, integer, text, text, text, text, text, text[], text[], text, text, boolean, integer, boolean
) to authenticated;
