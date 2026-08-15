-- Admin authentication/RBAC foundation.
-- Supabase Auth remains the identity and password source of truth. These
-- tables hold only application profile and authorization data.

create type public.app_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role)
);

comment on table public.profiles is 'Application profile data; authentication identity remains in auth.users.';
comment on table public.user_roles is 'Application authorization data; roles are assigned only through a trusted administrative path.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;

  -- Least privilege: a new account is never an admin automatically.
  insert into public.user_roles (user_id, role)
  values (new.id, 'viewer'::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.has_app_role(
  target_user_id uuid,
  required_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = target_user_id
      and role = required_role
  );
$$;

revoke all on function public.has_app_role(uuid, public.app_role) from public;
grant execute on function public.has_app_role(uuid, public.app_role) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

revoke all on public.profiles from anon;
revoke all on public.user_roles from anon;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;

create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  );

create policy user_roles_select_own_or_admin
  on public.user_roles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  );

-- Role changes are deliberately not self-service. An admin may assign or
-- revoke roles for another user through a trusted administrative path, but
-- may not mutate their own role rows through the client-facing table grants.
create policy user_roles_admin_insert_for_other_users
  on public.user_roles
  for insert
  to authenticated
  with check (
    user_id <> (select auth.uid())
    and public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  );

create policy user_roles_admin_update_for_other_users
  on public.user_roles
  for update
  to authenticated
  using (
    user_id <> (select auth.uid())
    and public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  )
  with check (
    user_id <> (select auth.uid())
    and public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  );

create policy user_roles_admin_delete_for_other_users
  on public.user_roles
  for delete
  to authenticated
  using (
    user_id <> (select auth.uid())
    and public.has_app_role((select auth.uid()), 'admin'::public.app_role)
  );
