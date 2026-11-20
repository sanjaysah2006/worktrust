-- =====================================================================
-- WorkTrust — Phase 6 Migration
-- Adds what the submission/approval/dispute workflow needs on top of
-- phase2_migration.sql and phase5_migration.sql
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
-- 1. submissions.github_url — the spec asks for a message, a project
--    URL, and a GitHub URL, but phase2_migration.sql only created one
--    `url` column. `url` keeps being the project/demo URL; this adds
--    the missing GitHub repository URL.
-- ---------------------------------------------------------------------
alter table public.submissions
  add column if not exists github_url text not null default '';

alter table public.submissions
  alter column github_url drop default;

-- ---------------------------------------------------------------------
-- 2. blockchain_transactions.tx_type — raising a dispute is a real
--    on-chain transaction (it costs gas and needs a MetaMask
--    signature) but doesn't move any funds, so it doesn't fit 'fund',
--    'release', or 'refund'. Adds 'dispute' as an allowed type so it
--    can be logged like every other transaction.
-- ---------------------------------------------------------------------
alter table public.blockchain_transactions
  drop constraint if exists blockchain_transactions_tx_type_check;

alter table public.blockchain_transactions
  add constraint blockchain_transactions_tx_type_check
  check (tx_type in ('fund', 'release', 'refund', 'dispute'));
