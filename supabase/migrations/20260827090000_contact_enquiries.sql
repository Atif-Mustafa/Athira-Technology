-- Durable contact enquiry management.
-- Public submissions are accepted only through a service-role-only function.
-- Staff reads use RLS; all mutations use guarded, atomic functions.

create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique
    check (reference_code ~ '^ATH-[A-F0-9]{10}$'),
  submission_key uuid not null unique,
  request_id text not null
    check (request_id ~ '^contact_[0-9a-f-]{36}$'),
  full_name text not null check (char_length(full_name) between 2 and 100),
  work_email text not null check (char_length(work_email) between 3 and 254),
  company_name text not null check (char_length(company_name) between 2 and 120),
  interest text not null check (char_length(interest) between 1 and 80),
  project_stage text check (project_stage is null or char_length(project_stage) between 1 and 80),
  budget_range text check (budget_range is null or char_length(budget_range) between 1 and 80),
  message text not null check (char_length(message) between 20 and 3000),
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  assigned_to uuid references public.profiles(id) on delete set null,
  source text not null default 'website' check (source = 'website'),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed')),
  privacy_acknowledged_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  first_reviewed_at timestamptz,
  closed_at timestamptz,
  version integer not null default 1 check (version > 0),
  search_text text generated always as (
    lower(reference_code || ' ' || full_name || ' ' || work_email || ' ' || company_name)
  ) stored
);

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.contact_enquiries(id) on delete cascade,
  author_user_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.enquiry_audit_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.contact_enquiries(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete restrict,
  action text not null check (action in (
    'ENQUIRY_CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED',
    'UNASSIGNED', 'NOTE_ADDED', 'NOTE_EDITED', 'ENQUIRY_CLOSED',
    'ENQUIRY_REOPENED', 'NOTIFICATION_SENT', 'NOTIFICATION_FAILED'
  )),
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index contact_enquiries_created_at_idx
  on public.contact_enquiries (created_at desc, id desc);
create index contact_enquiries_status_created_at_idx
  on public.contact_enquiries (status, created_at desc, id desc);
create index contact_enquiries_priority_created_at_idx
  on public.contact_enquiries (priority, created_at desc, id desc);
create index contact_enquiries_assigned_created_at_idx
  on public.contact_enquiries (assigned_to, created_at desc, id desc)
  where assigned_to is not null;
create index contact_enquiries_notification_failures_idx
  on public.contact_enquiries (created_at desc)
  where notification_status = 'failed';
create index enquiry_notes_enquiry_created_at_idx
  on public.enquiry_notes (enquiry_id, created_at asc, id asc);
create index enquiry_notes_author_user_id_idx
  on public.enquiry_notes (author_user_id);
create index enquiry_audit_enquiry_created_at_idx
  on public.enquiry_audit_events (enquiry_id, created_at asc, id asc);
create index enquiry_audit_actor_user_id_idx
  on public.enquiry_audit_events (actor_user_id)
  where actor_user_id is not null;

alter table public.contact_enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.enquiry_audit_events enable row level security;

revoke all on table public.contact_enquiries from public, anon, authenticated, service_role;
revoke all on table public.enquiry_notes from public, anon, authenticated, service_role;
revoke all on table public.enquiry_audit_events from public, anon, authenticated, service_role;
grant select on table public.contact_enquiries to authenticated;
grant select on table public.enquiry_notes to authenticated;
grant select on table public.enquiry_audit_events to authenticated;

create or replace function public.enquiry_actor_has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    join public.user_roles as user_role on user_role.user_id = profile.id
    where profile.id = (select auth.uid())
      and profile.status = 'active'
      and user_role.role = any(required_roles)
  );
$$;

revoke all on function public.enquiry_actor_has_any_role(public.app_role[]) from public, anon, service_role;
grant execute on function public.enquiry_actor_has_any_role(public.app_role[]) to authenticated;

create policy contact_enquiries_staff_select
  on public.contact_enquiries for select to authenticated
  using ((select public.enquiry_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  )));

create policy enquiry_notes_staff_select
  on public.enquiry_notes for select to authenticated
  using ((select public.enquiry_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  )));

create policy enquiry_audit_events_staff_select
  on public.enquiry_audit_events for select to authenticated
  using ((select public.enquiry_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  )));

-- Staff need only the small profile directory to attribute assignees, notes,
-- and audit events. Disabled accounts remain visible for historical attribution.
create policy profiles_select_for_active_staff
  on public.profiles for select to authenticated
  using ((select public.enquiry_actor_has_any_role(
    array['admin', 'editor', 'viewer']::public.app_role[]
  )));

create or replace function public.contact_create_enquiry(
  new_submission_key uuid,
  new_request_id text,
  new_full_name text,
  new_work_email text,
  new_company_name text,
  new_interest text,
  new_project_stage text,
  new_budget_range text,
  new_message text
)
returns table(
  enquiry_id uuid,
  enquiry_reference text,
  enquiry_notification_status text,
  was_created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_row public.contact_enquiries%rowtype;
  created_row public.contact_enquiries%rowtype;
  generated_reference text;
  attempt integer := 0;
begin
  if new_submission_key is null
    or new_request_id !~ '^contact_[0-9a-f-]{36}$'
    or char_length(trim(new_full_name)) not between 2 and 100
    or char_length(trim(new_work_email)) not between 3 and 254
    or char_length(trim(new_company_name)) not between 2 and 120
    or char_length(trim(new_interest)) not between 1 and 80
    or (new_project_stage is not null and char_length(trim(new_project_stage)) not between 1 and 80)
    or (new_budget_range is not null and char_length(trim(new_budget_range)) not between 1 and 80)
    or char_length(trim(new_message)) not between 20 and 3000 then
    raise exception 'contact_invalid' using errcode = '22023';
  end if;

  select * into existing_row
  from public.contact_enquiries
  where submission_key = new_submission_key;

  if found then
    return query select existing_row.id, existing_row.reference_code,
      existing_row.notification_status, false;
    return;
  end if;

  loop
    attempt := attempt + 1;
    generated_reference := 'ATH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      insert into public.contact_enquiries (
        reference_code, submission_key, request_id, full_name, work_email,
        company_name, interest, project_stage, budget_range, message
      ) values (
        generated_reference, new_submission_key, new_request_id,
        trim(new_full_name), lower(trim(new_work_email)), trim(new_company_name),
        trim(new_interest), nullif(trim(new_project_stage), ''),
        nullif(trim(new_budget_range), ''), trim(new_message)
      ) returning * into created_row;
      exit;
    exception when unique_violation then
      select * into existing_row
      from public.contact_enquiries
      where submission_key = new_submission_key;
      if found then
        return query select existing_row.id, existing_row.reference_code,
          existing_row.notification_status, false;
        return;
      end if;
      if attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    created_row.id, null, 'ENQUIRY_CREATED', null,
    jsonb_build_object('status', 'new', 'notification_status', 'pending')
  );

  return query select created_row.id, created_row.reference_code,
    created_row.notification_status, true;
end;
$$;

create or replace function public.contact_set_notification_status(
  target_enquiry_id uuid,
  new_notification_status text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_row public.contact_enquiries%rowtype;
  new_version integer;
  audit_action text;
begin
  if new_notification_status not in ('sent', 'failed') then
    raise exception 'contact_invalid_notification_status' using errcode = '22023';
  end if;

  select * into previous_row
  from public.contact_enquiries
  where id = target_enquiry_id
  for update;
  if not found then raise exception 'contact_not_found' using errcode = 'P0002'; end if;

  if previous_row.notification_status = new_notification_status then
    return previous_row.version;
  end if;
  if previous_row.notification_status <> 'pending' then
    raise exception 'contact_notification_final' using errcode = '40001';
  end if;

  update public.contact_enquiries
  set notification_status = new_notification_status,
      updated_at = timezone('utc', now()),
      version = version + 1
  where id = target_enquiry_id
  returning version into new_version;

  audit_action := case when new_notification_status = 'sent'
    then 'NOTIFICATION_SENT' else 'NOTIFICATION_FAILED' end;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    target_enquiry_id, null, audit_action,
    jsonb_build_object('notification_status', previous_row.notification_status),
    jsonb_build_object('notification_status', new_notification_status)
  );
  return new_version;
end;
$$;

create or replace function public.enquiry_set_status(
  target_enquiry_id uuid,
  expected_version integer,
  new_status text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  previous_row public.contact_enquiries%rowtype;
  new_version integer;
  audit_action text;
begin
  if actor is null or not public.enquiry_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then raise exception 'enquiry_forbidden' using errcode = '42501'; end if;
  if new_status not in ('new', 'in_progress', 'waiting', 'resolved', 'closed') then
    raise exception 'enquiry_invalid_status' using errcode = '22023';
  end if;

  select * into previous_row from public.contact_enquiries
  where id = target_enquiry_id for update;
  if not found then raise exception 'enquiry_not_found' using errcode = 'P0002'; end if;
  if previous_row.version is distinct from expected_version then
    raise exception 'enquiry_conflict' using errcode = '40001';
  end if;
  if previous_row.status = new_status then return previous_row.version; end if;

  if not (
    (previous_row.status = 'new' and new_status in ('in_progress', 'closed'))
    or (previous_row.status = 'in_progress' and new_status in ('waiting', 'resolved', 'closed'))
    or (previous_row.status = 'waiting' and new_status in ('in_progress', 'resolved', 'closed'))
    or (previous_row.status = 'resolved' and new_status in ('closed', 'in_progress'))
    or (previous_row.status = 'closed' and new_status = 'in_progress')
  ) then raise exception 'enquiry_invalid_transition' using errcode = '22023'; end if;

  update public.contact_enquiries
  set status = new_status,
      first_reviewed_at = case
        when first_reviewed_at is null and previous_row.status = 'new' then timezone('utc', now())
        else first_reviewed_at end,
      closed_at = case when new_status = 'closed' then timezone('utc', now())
        when previous_row.status = 'closed' then null else closed_at end,
      updated_at = timezone('utc', now()),
      version = version + 1
  where id = target_enquiry_id returning version into new_version;

  audit_action := case
    when new_status = 'closed' then 'ENQUIRY_CLOSED'
    when previous_row.status = 'closed' then 'ENQUIRY_REOPENED'
    else 'STATUS_CHANGED' end;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    target_enquiry_id, actor, audit_action,
    jsonb_build_object('status', previous_row.status),
    jsonb_build_object('status', new_status)
  );
  return new_version;
end;
$$;

create or replace function public.enquiry_set_priority(
  target_enquiry_id uuid,
  expected_version integer,
  new_priority text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  previous_row public.contact_enquiries%rowtype;
  new_version integer;
begin
  if actor is null or not public.enquiry_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then raise exception 'enquiry_forbidden' using errcode = '42501'; end if;
  if new_priority not in ('low', 'normal', 'high') then
    raise exception 'enquiry_invalid_priority' using errcode = '22023';
  end if;
  select * into previous_row from public.contact_enquiries
  where id = target_enquiry_id for update;
  if not found then raise exception 'enquiry_not_found' using errcode = 'P0002'; end if;
  if previous_row.version is distinct from expected_version then
    raise exception 'enquiry_conflict' using errcode = '40001';
  end if;
  if previous_row.priority = new_priority then return previous_row.version; end if;

  update public.contact_enquiries
  set priority = new_priority, updated_at = timezone('utc', now()), version = version + 1
  where id = target_enquiry_id returning version into new_version;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    target_enquiry_id, actor, 'PRIORITY_CHANGED',
    jsonb_build_object('priority', previous_row.priority),
    jsonb_build_object('priority', new_priority)
  );
  return new_version;
end;
$$;

create or replace function public.enquiry_assign(
  target_enquiry_id uuid,
  expected_version integer,
  new_assignee uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  previous_row public.contact_enquiries%rowtype;
  new_version integer;
begin
  if actor is null or not public.enquiry_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then raise exception 'enquiry_forbidden' using errcode = '42501'; end if;
  if new_assignee is not null and not exists (
    select 1 from public.profiles as profile
    join public.user_roles as user_role on user_role.user_id = profile.id
    where profile.id = new_assignee and profile.status = 'active'
      and user_role.role = any(array['admin', 'editor']::public.app_role[])
  ) then raise exception 'enquiry_invalid_assignee' using errcode = '22023'; end if;

  select * into previous_row from public.contact_enquiries
  where id = target_enquiry_id for update;
  if not found then raise exception 'enquiry_not_found' using errcode = 'P0002'; end if;
  if previous_row.version is distinct from expected_version then
    raise exception 'enquiry_conflict' using errcode = '40001';
  end if;
  if previous_row.assigned_to is not distinct from new_assignee then return previous_row.version; end if;

  update public.contact_enquiries
  set assigned_to = new_assignee, updated_at = timezone('utc', now()), version = version + 1
  where id = target_enquiry_id returning version into new_version;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    target_enquiry_id, actor,
    case when new_assignee is null then 'UNASSIGNED' else 'ASSIGNED' end,
    jsonb_build_object('assigned_to', previous_row.assigned_to),
    jsonb_build_object('assigned_to', new_assignee)
  );
  return new_version;
end;
$$;

create or replace function public.enquiry_add_note(
  target_enquiry_id uuid,
  expected_version integer,
  note_body text
)
returns table(note_id uuid, enquiry_version integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  previous_row public.contact_enquiries%rowtype;
  created_note_id uuid;
  new_version integer;
begin
  if actor is null or not public.enquiry_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then raise exception 'enquiry_forbidden' using errcode = '42501'; end if;
  if char_length(trim(note_body)) not between 1 and 4000 then
    raise exception 'enquiry_invalid_note' using errcode = '22023';
  end if;
  select * into previous_row from public.contact_enquiries
  where id = target_enquiry_id for update;
  if not found then raise exception 'enquiry_not_found' using errcode = 'P0002'; end if;
  if previous_row.version is distinct from expected_version then
    raise exception 'enquiry_conflict' using errcode = '40001';
  end if;

  insert into public.enquiry_notes (enquiry_id, author_user_id, body)
  values (target_enquiry_id, actor, trim(note_body)) returning id into created_note_id;
  update public.contact_enquiries
  set updated_at = timezone('utc', now()), version = version + 1
  where id = target_enquiry_id returning version into new_version;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    target_enquiry_id, actor, 'NOTE_ADDED', null,
    jsonb_build_object('note_id', created_note_id)
  );
  return query select created_note_id, new_version;
end;
$$;

create or replace function public.enquiry_edit_note(
  target_note_id uuid,
  expected_version integer,
  note_body text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  previous_note public.enquiry_notes%rowtype;
  enquiry_row public.contact_enquiries%rowtype;
  new_version integer;
begin
  if actor is null or not public.enquiry_actor_has_any_role(
    array['admin', 'editor']::public.app_role[]
  ) then raise exception 'enquiry_forbidden' using errcode = '42501'; end if;
  if char_length(trim(note_body)) not between 1 and 4000 then
    raise exception 'enquiry_invalid_note' using errcode = '22023';
  end if;
  select * into previous_note from public.enquiry_notes
  where id = target_note_id for update;
  if not found then raise exception 'enquiry_note_not_found' using errcode = 'P0002'; end if;
  if previous_note.author_user_id <> actor then
    raise exception 'enquiry_forbidden' using errcode = '42501';
  end if;
  select * into enquiry_row from public.contact_enquiries
  where id = previous_note.enquiry_id for update;
  if enquiry_row.version is distinct from expected_version then
    raise exception 'enquiry_conflict' using errcode = '40001';
  end if;
  if previous_note.body = trim(note_body) then return enquiry_row.version; end if;

  update public.enquiry_notes
  set body = trim(note_body), updated_at = timezone('utc', now())
  where id = target_note_id;
  update public.contact_enquiries
  set updated_at = timezone('utc', now()), version = version + 1
  where id = previous_note.enquiry_id returning version into new_version;
  insert into public.enquiry_audit_events (
    enquiry_id, actor_user_id, action, previous_value, new_value
  ) values (
    previous_note.enquiry_id, actor, 'NOTE_EDITED',
    jsonb_build_object('note_id', target_note_id, 'edited', false),
    jsonb_build_object('note_id', target_note_id, 'edited', true)
  );
  return new_version;
end;
$$;

create or replace function public.enquiry_assignable_staff()
returns table(user_id uuid, display_name text, role public.app_role)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id, coalesce(nullif(trim(profile.display_name), ''), 'Unnamed staff'), user_role.role
  from public.profiles as profile
  join public.user_roles as user_role on user_role.user_id = profile.id
  where public.enquiry_actor_has_any_role(array['admin', 'editor', 'viewer']::public.app_role[])
    and profile.status = 'active'
    and user_role.role = any(array['admin', 'editor']::public.app_role[])
  order by profile.display_name nulls last, profile.id;
$$;

revoke all on function public.contact_create_enquiry(uuid, text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.contact_set_notification_status(uuid, text)
  from public, anon, authenticated;
grant execute on function public.contact_create_enquiry(uuid, text, text, text, text, text, text, text, text)
  to service_role;
grant execute on function public.contact_set_notification_status(uuid, text)
  to service_role;

revoke all on function public.enquiry_set_status(uuid, integer, text) from public, anon, service_role;
revoke all on function public.enquiry_set_priority(uuid, integer, text) from public, anon, service_role;
revoke all on function public.enquiry_assign(uuid, integer, uuid) from public, anon, service_role;
revoke all on function public.enquiry_add_note(uuid, integer, text) from public, anon, service_role;
revoke all on function public.enquiry_edit_note(uuid, integer, text) from public, anon, service_role;
revoke all on function public.enquiry_assignable_staff() from public, anon, service_role;
grant execute on function public.enquiry_set_status(uuid, integer, text) to authenticated;
grant execute on function public.enquiry_set_priority(uuid, integer, text) to authenticated;
grant execute on function public.enquiry_assign(uuid, integer, uuid) to authenticated;
grant execute on function public.enquiry_add_note(uuid, integer, text) to authenticated;
grant execute on function public.enquiry_edit_note(uuid, integer, text) to authenticated;
grant execute on function public.enquiry_assignable_staff() to authenticated;

comment on table public.contact_enquiries is
  'Durable business enquiries. Raw IPs, rate-limit identifiers, headers, cookies, and secrets are prohibited.';
comment on table public.enquiry_notes is 'Internal-only staff notes; never customer-visible.';
comment on table public.enquiry_audit_events is 'Minimal operational enquiry audit trail without message bodies or secrets.';
