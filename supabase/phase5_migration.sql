-- =====================================================================
-- WorkTrust — Phase 5 Migration
-- Adds what the blockchain integration needs on top of phase2_migration.sql
--
-- HOW TO RUN THIS FILE:
-- 1. Open your project at https://supabase.com/dashboard
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Paste the ENTIRE contents of this file
-- 5. Click "Run"
-- This file is safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. hires.escrow_id — stores the on-chain escrow ID (EscrowManager's
--    escrowCount value) once a hire has been funded. Was missing from
--    phase2_migration.sql.
-- ---------------------------------------------------------------------
alter table public.hires
  add column if not exists escrow_id bigint;

-- Two different hires should never share the same on-chain escrow ID.
-- Partial index (ignores nulls) so unfunded hires (escrow_id = null)
-- don't conflict with each other.
create unique index if not exists idx_hires_escrow_id_unique
  on public.hires (escrow_id)
  where escrow_id is not null;

-- ---------------------------------------------------------------------
-- 2. hires.application_id — add a UNIQUE constraint. Functionally an
--    application is only ever turned into one hire, but this was never
--    enforced at the database level. Enforcing it also lets Supabase
--    embed `hires` under `applications` as a single object instead of
--    an array, which is what the FreelancerDashboard's query relies on.
-- ---------------------------------------------------------------------
alter table public.hires
  drop constraint if exists hires_application_id_key;

alter table public.hires
  add constraint hires_application_id_key unique (application_id);

-- ---------------------------------------------------------------------
-- 3. Precision fix for money columns used to fund real (test) ETH.
--    numeric(12,2) only keeps 2 decimal places, but JobDetails already
--    lets freelancers propose amounts like 0.0055 ETH (step="0.0001").
--    Funding an escrow with a rounded amount would send the wrong
--    amount of ETH, so these are widened to match
--    blockchain_transactions.amount (numeric(18,8), i.e. up to 8
--    decimal places — plenty for ETH).
-- ---------------------------------------------------------------------
alter table public.jobs
  alter column budget type numeric(18, 8);

alter table public.applications
  alter column proposed_amount type numeric(18, 8);

alter table public.hires
  alter column amount type numeric(18, 8);
