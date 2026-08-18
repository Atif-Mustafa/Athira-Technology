-- Functional admin user management.

create table public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('USER_INVITED', 'ROLE_CHANGED', 'USER_DISABLED', 'USER_ENABLED')),
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index admin_audit_events_target_created_at_idx
  on public.admin_audit_events (target_user_id, created_at desc);

alter table public.admin_audit_events enable row level security;
revoke all on public.admin_audit_events from public, anon, authenticated, service_role;
grant select on public.admin_audit_events to service_role;

create or replace view public.admin_user_directory as
select
  auth_user.id,
  auth_user.email,
  profile.display_name,
  coalesce(profile.status, 'disabled') as status,
  role_row.role,
  auth_user.created_at,
  auth_user.last_sign_in_at,
  auth_user.email_confirmed_at,
  lower(coalesce(auth_user.email, '') || ' ' || coalesce(profile.display_name, '')) as search_text
from auth.users as auth_user
left join public.profiles as profile on profile.id = auth_user.id
left join lateral (
  select user_role.role
  from public.user_roles as user_role
  where user_role.user_id = auth_user.id
  order by case user_role.role
    when 'admin'::public.app_role then 3
    when 'editor'::public.app_role then 2
    when 'viewer'::public.app_role then 1
  end desc
  limit 1
) as role_row on true;

revoke all on public.admin_user_directory from public, anon, authenticated, service_role;
grant select on public.admin_user_directory to service_role;

create or replace function public.admin_actor_is_active_admin(actor uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_roles as user_role
    join public.profiles as profile on profile.id = user_role.user_id
    where user_role.user_id = actor
      and user_role.role = 'admin'::public.app_role
      and profile.status = 'active'
  );
$$;

revoke all on function public.admin_actor_is_active_admin(uuid) from public, anon, authenticated;

create or replace function public.admin_finalize_invitation(
  target_user_id uuid,
  new_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not public.admin_actor_is_active_admin(actor) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if actor = target_user_id then
    raise exception 'self_protection' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(241781993);

  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;

  delete from public.user_roles where user_id = target_user_id;
  insert into public.user_roles (user_id, role)
  values (target_user_id, new_role);

  insert into public.admin_audit_events (
    actor_user_id, target_user_id, action, previous_value, new_value
  )
  values (
    actor, target_user_id, 'USER_INVITED', null,
    jsonb_build_object('role', new_role::text)
  );
end;
$$;

create or replace function public.admin_change_user_role(
  target_user_id uuid,
  new_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor uuid := auth.uid();
  previous_role public.app_role;
  target_status text;
  active_admin_count integer;
begin
  if actor is null or not public.admin_actor_is_active_admin(actor) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if actor = target_user_id then
    raise exception 'self_protection' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(241781993);

  select directory.status, directory.role
  into target_status, previous_role
  from public.admin_user_directory as directory
  where directory.id = target_user_id;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;
  if previous_role = new_role then
    return;
  end if;

  if target_status = 'active'
    and previous_role = 'admin'::public.app_role
    and new_role <> 'admin'::public.app_role then
    select count(distinct user_role.user_id)::integer
    into active_admin_count
    from public.user_roles as user_role
    join public.profiles as profile on profile.id = user_role.user_id
    where user_role.role = 'admin'::public.app_role
      and profile.status = 'active';

    if active_admin_count <= 1 then
      raise exception 'last_active_admin' using errcode = 'P0001';
    end if;
  end if;

  delete from public.user_roles where user_id = target_user_id;
  insert into public.user_roles (user_id, role)
  values (target_user_id, new_role);

  insert into public.admin_audit_events (
    actor_user_id, target_user_id, action, previous_value, new_value
  )
  values (
    actor, target_user_id, 'ROLE_CHANGED',
    jsonb_build_object('role', previous_role::text),
    jsonb_build_object('role', new_role::text)
  );
end;
$$;

create or replace function public.admin_set_user_status(
  target_user_id uuid,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor uuid := auth.uid();
  previous_status text;
  target_role public.app_role;
  active_admin_count integer;
  audit_action text;
begin
  if actor is null or not public.admin_actor_is_active_admin(actor) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if new_status not in ('active', 'disabled') then
    raise exception 'invalid_status' using errcode = 'P0001';
  end if;
  if actor = target_user_id and new_status = 'disabled' then
    raise exception 'self_protection' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(241781993);

  select directory.status, directory.role
  into previous_status, target_role
  from public.admin_user_directory as directory
  where directory.id = target_user_id;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;
  if previous_status = new_status then
    return;
  end if;

  if previous_status = 'active'
    and new_status = 'disabled'
    and target_role = 'admin'::public.app_role then
    select count(distinct user_role.user_id)::integer
    into active_admin_count
    from public.user_roles as user_role
    join public.profiles as profile on profile.id = user_role.user_id
    where user_role.role = 'admin'::public.app_role
      and profile.status = 'active';

    if active_admin_count <= 1 then
      raise exception 'last_active_admin' using errcode = 'P0001';
    end if;
  end if;

  update public.profiles
  set status = new_status,
      updated_at = timezone('utc', now())
  where id = target_user_id;

  audit_action := case when new_status = 'disabled' then 'USER_DISABLED' else 'USER_ENABLED' end;

  insert into public.admin_audit_events (
    actor_user_id, target_user_id, action, previous_value, new_value
  )
  values (
    actor, target_user_id, audit_action,
    jsonb_build_object('status', previous_status),
    jsonb_build_object('status', new_status)
  );
end;
$$;

revoke all on function public.admin_finalize_invitation(uuid, public.app_role) from public, anon, service_role;
revoke all on function public.admin_change_user_role(uuid, public.app_role) from public, anon, service_role;
revoke all on function public.admin_set_user_status(uuid, text) from public, anon, service_role;

grant execute on function public.admin_finalize_invitation(uuid, public.app_role) to authenticated;
grant execute on function public.admin_change_user_role(uuid, public.app_role) to authenticated;
grant execute on function public.admin_set_user_status(uuid, text) to authenticated;
