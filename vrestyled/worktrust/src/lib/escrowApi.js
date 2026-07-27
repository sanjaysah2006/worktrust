// src/lib/escrowApi.js
//
// Supabase reads/writes related to escrow funding. Kept separate from
// jobsApi.js since these are specifically about the hires <-> blockchain
// link, not core job/application logic.

import { supabase } from './supabase'
import { CONTRACT_ADDRESS } from './blockchain'

// One hire, with the job title and both parties' current wallet
// addresses attached. Used by the EscrowFunding page.
export async function fetchHireById(hireId) {
  return supabase
    .from('hires')
    .select(
      `
      id,
      job_id,
      client_id,
      freelancer_id,
      amount,
      escrow_status,
      escrow_id,
      client_wallet_address,
      freelancer_wallet_address,
      contract_address,
      created_at,
      job:jobs(id, title, status),
      freelancer:profiles!freelancer_id(full_name, wallet_address),
      client:profiles!client_id(full_name, wallet_address)
    `
    )
    .eq('id', hireId)
    .single()
}

// Marks a hire as funded once the on-chain transaction is confirmed.
// Snapshots the exact wallet addresses used, so the record stays
// accurate even if a profile's wallet address changes later.
export async function markHireFunded({ hireId, escrowId, clientWallet, freelancerWallet }) {
  return supabase
    .from('hires')
    .update({
      escrow_status: 'funded',
      escrow_id: escrowId,
      client_wallet_address: clientWallet,
      freelancer_wallet_address: freelancerWallet,
      contract_address: CONTRACT_ADDRESS,
    })
    .eq('id', hireId)
    .eq('escrow_status', 'pending') // extra safety: only updates if still unfunded
    .select()
    .single()
}

// Marks a hire as released after the client's approval transaction is
// confirmed on-chain. Only transitions from 'funded', as a safety net.
export async function markHireReleased(hireId) {
  return supabase
    .from('hires')
    .update({ escrow_status: 'released' })
    .eq('id', hireId)
    .eq('escrow_status', 'funded')
    .select()
    .single()
}

// Logs a transaction the moment MetaMask returns a hash, with status
// "pending". Used before the transaction is mined.
export async function logPendingTransaction({ hireId, txHash, fromAddress, toAddress, amount, txType }) {
  return supabase
    .from('blockchain_transactions')
    .insert({
      hire_id: hireId,
      tx_hash: txHash,
      tx_type: txType,
      from_address: fromAddress,
      to_address: toAddress,
      amount,
      status: 'pending',
    })
    .select()
    .single()
}

// Updates a logged transaction once it's mined (or fails).
export async function updateTransactionStatus(txHash, status) {
  return supabase.from('blockchain_transactions').update({ status }).eq('tx_hash', txHash)
}

// Transaction history for one hire, newest first. Used to show past
// funding attempts on the EscrowFunding page.
export async function fetchTransactionsForHire(hireId) {
  return supabase
    .from('blockchain_transactions')
    .select('*')
    .eq('hire_id', hireId)
    .order('created_at', { ascending: false })
}

// Every transaction the current user is allowed to see, newest first.
// No manual filtering needed here — the blockchain_tx_select RLS
// policy already limits rows to hires the user is the client or
// freelancer on (or every row, for an admin).
export async function fetchMyTransactions() {
  return supabase
    .from('blockchain_transactions')
    .select('*, hire:hires(id, job:jobs(title), client_id, freelancer_id)')
    .order('created_at', { ascending: false })
}
