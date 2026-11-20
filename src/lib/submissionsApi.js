// src/lib/submissionsApi.js
//
// Supabase reads/writes for the "freelancer submits work, client
// approves/rejects" workflow.

import { supabase } from './supabase'

// All submissions for one hire, newest first.
export async function fetchSubmissionsForHire(hireId) {
  return supabase
    .from('submissions')
    .select('*')
    .eq('hire_id', hireId)
    .order('created_at', { ascending: false })
}

// Freelancer submits completed work.
export async function createSubmission({ hireId, freelancerId, message, url, githubUrl }) {
  return supabase
    .from('submissions')
    .insert({
      hire_id: hireId,
      freelancer_id: freelancerId,
      message,
      url,
      github_url: githubUrl,
    })
    .select()
    .single()
}

// Client rejects a submission (asks for revisions). No blockchain
// transaction involved — the escrow stays funded and the freelancer
// can submit again.
export async function rejectSubmission(submissionId) {
  return supabase
    .from('submissions')
    .update({ status: 'rejected' })
    .eq('id', submissionId)
    .select()
    .single()
}

// Client approves a submission. Called only AFTER the on-chain
// releasePayment transaction has already been confirmed.
export async function approveSubmission(submissionId) {
  return supabase
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)
    .select()
    .single()
}
