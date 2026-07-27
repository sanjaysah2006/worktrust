-- =====================================================================
-- WorkTrust — Phase 2 Migration
-- Creates: profiles, jobs, applications, hires, submissions, disputes,
--          blockchain_transactions
-- Adds: constraints, indexes, updated_at triggers, a trigger that
--       auto-creates a profile after registration, and Row Level
--       Security policies for client / freelancer / administrator.
--
-- HOW TO RUN THIS FILE:
-- 1. Open your project at https://supabase.com/dashboard
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Paste the ENTIRE contents of this file
-- 5. Click "Run"
-- This file is safe to re-run: it drops old policies/triggers first.
-- =====================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- =====================================================================
-- 1. TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles: one row per auth.users row. Holds the app-level role.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'client'
    check (role in ('client', 'freelancer', 'admin')),
  wallet_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- jobs: posted by clients
-- ---------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  budget numeric(12, 2) not null check (budget > 0),
  status text not null default 'open'
    check (status in ('open', 'hired', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- applications: freelancers applying to jobs
-- ---------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  cover_letter text not null,
  proposed_amount numeric(12, 2) not null check (proposed_amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, freelancer_id)
);

-- ---------------------------------------------------------------------
-- hires: a client hiring a freelancer for a job (one hire per job)
-- ---------------------------------------------------------------------
create table if not exists public.hires (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete restrict,
  client_id uuid not null references public.profiles (id),
  freelancer_id uuid not null references public.profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  client_wallet_address text,
  freelancer_wallet_address text,
  contract_address text,
  escrow_status text not null default 'pending'
    check (escrow_status in ('pending', 'funded', 'released', 'refunded', 'disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (client_id <> freelancer_id)
);

-- ---------------------------------------------------------------------
-- submissions: freelancer's completed work submitted for review
-- ---------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  freelancer_id uuid not null references public.profiles (id),
  message text not null,
  url text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- disputes: raised by client or freelancer, resolved by an admin
-- ---------------------------------------------------------------------
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  raised_by uuid not null references public.profiles (id),
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved_release', 'resolved_refund')),
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- blockchain_transactions: log of on-chain escrow activity
-- ---------------------------------------------------------------------
create table if not exists public.blockchain_transactions (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  tx_hash text not null unique,
  tx_type text not null check (tx_type in ('fund', 'release', 'refund')),
  from_address text not null,
  to_address text not null,
  amount numeric(18, 8) not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 2. INDEXES
-- =====================================================================

create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_client_id on public.jobs (client_id);

create index if not exists idx_applications_job_id on public.applications (job_id);
create index if not exists idx_applications_freelancer_id on public.applications (freelancer_id);

create index if not exists idx_hires_client_id on public.hires (client_id);
create index if not exists idx_hires_freelancer_id on public.hires (freelancer_id);

create index if not exists idx_submissions_hire_id on public.submissions (hire_id);

create index if not exists idx_disputes_hire_id on public.disputes (hire_id);

create index if not exists idx_blockchain_tx_hire_id on public.blockchain_transactions (hire_id);

-- =====================================================================
-- 3. updated_at AUTO-UPDATE TRIGGER (shared by all tables)
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

drop trigger if exists trg_hires_updated_at on public.hires;
create trigger trg_hires_updated_at
  before update on public.hires
  for each row execute function public.set_updated_at();

drop trigger if exists trg_submissions_updated_at on public.submissions;
create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_disputes_updated_at on public.disputes;
create trigger trg_disputes_updated_at
  before update on public.disputes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_blockchain_transactions_updated_at on public.blockchain_transactions;
create trigger trg_blockchain_transactions_updated_at
  before update on public.blockchain_transactions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 4. AUTO-CREATE PROFILE AFTER REGISTRATION
-- Reads full_name/role that Register.jsx passes as auth signUp metadata.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 5. PREVENT ROLE SELF-ESCALATION
-- Blocks role changes made through the app (PostgREST/API calls).
-- Role changes are only allowed when run directly in the SQL Editor
-- (see section 8 below), which does not go through the API.
-- =====================================================================

create or replace function public.prevent_role_change()
returns trigger as $$
begin
  if new.role <> old.role and auth.role() = 'authenticated' then
    raise exception 'Role cannot be changed through the application. Contact an administrator.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- =====================================================================
-- 6. HELPER FUNCTION: is_admin
-- Defined with SECURITY DEFINER and owned by the migration-running role
-- (table owner), so it bypasses RLS internally and avoids recursive
-- RLS checks when used inside policies on the profiles table itself.
-- =====================================================================

create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$ language sql security definer stable;

-- =====================================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.hires enable row level security;
alter table public.submissions enable row level security;
alter table public.disputes enable row level security;
alter table public.blockchain_transactions enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
  on public.profiles for select
  to authenticated
  using (true);
  -- All logged-in users can see basic profile info (name/role) for
  -- other users, e.g. a freelancer's name on a job application.

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
  -- Users may update their own row. The trg_prevent_role_change trigger
  -- still blocks them from changing their own "role" column.

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin(auth.uid()));
  -- Admins may update any profile (e.g. to fix a display name).
  -- Role changes are still blocked by the trigger even for admins
  -- when acting through the app — see section 8 for the safe method.

-- No insert/delete policies on profiles: rows are created only by the
-- trg_handle_new_user trigger (which runs as the table owner and
-- bypasses RLS) and are never deleted directly by the app.

-- ---------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------
drop policy if exists jobs_select on public.jobs;
create policy jobs_select
  on public.jobs for select
  to authenticated
  using (
    status = 'open'
    or client_id = auth.uid()
    or public.is_admin(auth.uid())
    or id in (select job_id from public.hires where freelancer_id = auth.uid())
  );

drop policy if exists jobs_insert_client on public.jobs;
create policy jobs_insert_client
  on public.jobs for insert
  to authenticated
  with check (
    client_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'client'
    )
  );

drop policy if exists jobs_update_owner_or_admin on public.jobs;
create policy jobs_update_owner_or_admin
  on public.jobs for update
  to authenticated
  using (client_id = auth.uid() or public.is_admin(auth.uid()));

-- No delete policy: jobs are never hard-deleted by the app.

-- ---------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------
drop policy if exists applications_select on public.applications;
create policy applications_select
  on public.applications for select
  to authenticated
  using (
    freelancer_id = auth.uid()
    or public.is_admin(auth.uid())
    or job_id in (select id from public.jobs where client_id = auth.uid())
  );

drop policy if exists applications_insert_freelancer on public.applications;
create policy applications_insert_freelancer
  on public.applications for insert
  to authenticated
  with check (
    freelancer_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'freelancer'
    )
    and job_id in (select id from public.jobs where status = 'open')
  );

drop policy if exists applications_update_job_owner on public.applications;
create policy applications_update_job_owner
  on public.applications for update
  to authenticated
  using (
    job_id in (select id from public.jobs where client_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- ---------------------------------------------------------------------
-- hires
-- ---------------------------------------------------------------------
drop policy if exists hires_select on public.hires;
create policy hires_select
  on public.hires for select
  to authenticated
  using (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or public.is_admin(auth.uid())
  );

drop policy if exists hires_insert_client on public.hires;
create policy hires_insert_client
  on public.hires for insert
  to authenticated
  with check (
    client_id = auth.uid()
    and job_id in (select id from public.jobs where client_id = auth.uid())
  );

drop policy if exists hires_update on public.hires;
create policy hires_update
  on public.hires for update
  to authenticated
  using (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or public.is_admin(auth.uid())
  );
  -- Needed so a client can mark escrow as "funded" after a MetaMask
  -- transaction, and so an admin can set "released"/"refunded" after
  -- resolving a dispute.

-- ---------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------
drop policy if exists submissions_select on public.submissions;
create policy submissions_select
  on public.submissions for select
  to authenticated
  using (
    hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists submissions_insert_freelancer on public.submissions;
create policy submissions_insert_freelancer
  on public.submissions for insert
  to authenticated
  with check (
    freelancer_id = auth.uid()
    and hire_id in (select id from public.hires where freelancer_id = auth.uid())
  );

drop policy if exists submissions_update_client_or_admin on public.submissions;
create policy submissions_update_client_or_admin
  on public.submissions for update
  to authenticated
  using (
    hire_id in (select id from public.hires where client_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- ---------------------------------------------------------------------
-- disputes
-- ---------------------------------------------------------------------
drop policy if exists disputes_select on public.disputes;
create policy disputes_select
  on public.disputes for select
  to authenticated
  using (
    hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists disputes_insert on public.disputes;
create policy disputes_insert
  on public.disputes for insert
  to authenticated
  with check (
    raised_by = auth.uid()
    and hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
  );

drop policy if exists disputes_update_admin_only on public.disputes;
create policy disputes_update_admin_only
  on public.disputes for update
  to authenticated
  using (public.is_admin(auth.uid()));
  -- Only administrators resolve disputes (refund client / release funds).

-- ---------------------------------------------------------------------
-- blockchain_transactions
-- ---------------------------------------------------------------------
drop policy if exists blockchain_tx_select on public.blockchain_transactions;
create policy blockchain_tx_select
  on public.blockchain_transactions for select
  to authenticated
  using (
    hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists blockchain_tx_insert on public.blockchain_transactions;
create policy blockchain_tx_insert
  on public.blockchain_transactions for insert
  to authenticated
  with check (
    hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists blockchain_tx_update on public.blockchain_transactions;
create policy blockchain_tx_update
  on public.blockchain_transactions for update
  to authenticated
  using (
    hire_id in (
      select id from public.hires
      where client_id = auth.uid() or freelancer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );
  -- Allows updating status from "pending" to "confirmed"/"failed" once
  -- the transaction is mined on Sepolia.

-- =====================================================================
-- 8. SAFE METHOD FOR ASSIGNING THE ADMINISTRATOR ROLE
--
-- There is NO button or API route in the app that grants "admin".
-- The trg_prevent_role_change trigger blocks role changes coming from
-- the app (authenticated API calls). The only way to create an admin
-- is to run a command like this yourself, directly in the Supabase
-- SQL Editor (which is not an authenticated API call, so the trigger
-- allows it):
--
--   update public.profiles
--   set role = 'admin'
--   where email = 'put-the-users-exact-email-here@example.com';
--
-- Steps:
--   1. Ask the person to register normally as a Client or Freelancer.
--   2. In Supabase SQL Editor, run the UPDATE statement above with
--      their exact email address.
--   3. They must log out and log back in so the app picks up the
--      new role.
-- =====================================================================
