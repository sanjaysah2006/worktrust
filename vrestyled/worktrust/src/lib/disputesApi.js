// src/lib/disputesApi.js
//
// Supabase reads/writes for raising and resolving disputes.

import { supabase } from './supabase'

const HIRE_FIELDS = `
  id,
  job_id,
  amount,
  escrow_id,
  escrow_status,
  client_id,
  freelancer_id,
  client_wallet_address,
  freelancer_wallet_address,
  job:jobs(title),
  client:profiles!client_id(full_name, email),
  freelancer:profiles!freelancer_id(full_name, email)
`

// The dispute for one hire, if any. Used by EscrowFunding to show a
// read-only status to the client/freelancer while it's being resolved.
export async function fetchDisputeByHireId(hireId) {
  return supabase
    .from('disputes')
    .select('*')
    .eq('hire_id', hireId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}

// Client or freelancer raises a dispute. Called only AFTER the
// on-chain raiseDispute transaction has already been confirmed.
// Creates the dispute row AND moves the hire to 'disputed' so funds
// show as locked everywhere in the UI.
export async function fileDispute({ hireId, raisedBy, reason }) {
  const { data: dispute, error: disputeError } = await supabase
    .from('disputes')
    .insert({ hire_id: hireId, raised_by: raisedBy, reason })
    .select()
    .single()

  if (disputeError) {
    return { data: null, error: disputeError }
  }

  const { error: hireError } = await supabase
    .from('hires')
    .update({ escrow_status: 'disputed' })
    .eq('id', hireId)
    .eq('escrow_status', 'funded')

  if (hireError) {
    return { data: dispute, error: hireError }
  }

  return { data: dispute, error: null }
}

// All open (unresolved) disputes, newest first. Admin only — enforced
// both by disputes_select RLS and by the route's allowedRoles.
export async function fetchOpenDisputes() {
  return supabase
    .from('disputes')
    .select(
      `
      id,
      reason,
      status,
      created_at,
      raised_by,
      raiser:profiles!raised_by(full_name, role),
      hire:hires(${HIRE_FIELDS})
    `
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })
}

// Full detail for one dispute, including the hire, job, both parties,
// and who raised it.
export async function fetchDisputeById(disputeId) {
  return supabase
    .from('disputes')
    .select(
      `
      id,
      reason,
      status,
      created_at,
      resolved_at,
      raised_by,
      raiser:profiles!raised_by(full_name, role),
      resolver:profiles!resolved_by(full_name),
      hire:hires(${HIRE_FIELDS})
    `
    )
    .eq('id', disputeId)
    .single()
}

// Administrator resolves a dispute. Called only AFTER the on-chain
// resolveDispute transaction has already been confirmed. Updates the
// dispute record AND the hire's escrow_status together.
export async function resolveDisputeInDb({ disputeId, hireId, releaseToFreelancer, adminId }) {
  const { error: disputeError } = await supabase
    .from('disputes')
    .update({
      status: releaseToFreelancer ? 'resolved_release' : 'resolved_refund',
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', disputeId)

  if (disputeError) {
    return { error: disputeError }
  }

  const { error: hireError } = await supabase
    .from('hires')
    .update({ escrow_status: releaseToFreelancer ? 'released' : 'refunded' })
    .eq('id', hireId)
    .eq('escrow_status', 'disputed')

  return { error: hireError }
}
