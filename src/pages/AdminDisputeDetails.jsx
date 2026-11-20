// src/pages/AdminDisputeDetails.jsx
//
// Administrator reviews one dispute (including the freelancer's
// submitted work) and resolves it by releasing to the freelancer or
// refunding the client. Sends a MetaMask transaction; the database is
// only updated after that transaction is confirmed.
// Route: /admin/disputes/:disputeId

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { fetchDisputeById, resolveDisputeInDb } from '../lib/disputesApi'
import { fetchSubmissionsForHire } from '../lib/submissionsApi'
import { logPendingTransaction, updateTransactionStatus } from '../lib/escrowApi'
import {
  resolveEscrowDispute,
  getContractAdmin,
  CONTRACT_ADDRESS,
  shortenAddress,
} from '../lib/blockchain'
import {
  disputeStatusBadgeClass,
  submissionStatusBadgeClass,
  formatCurrency,
  formatDate,
} from '../lib/format'
import WalletButton from '../components/WalletButton.jsx'
import TransactionStatus from '../components/TransactionStatus.jsx'

function AdminDisputeDetails() {
  const { disputeId } = useParams()
  const { user } = useAuth()
  const { account, isCorrectNetwork } = useWallet()

  const [dispute, setDispute] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [contractAdmin, setContractAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [txStatus, setTxStatus] = useState('idle')
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [resolvingAction, setResolvingAction] = useState(null) // 'release' | 'refund' | null

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    const { data, error } = await fetchDisputeById(disputeId)
    if (error) {
      setLoadError(
        error.code === 'PGRST116' ? 'This dispute does not exist, or you do not have access to it.' : error.message
      )
      setLoading(false)
      return
    }
    setDispute(data)

    if (data.hire?.id) {
      const { data: subsData } = await fetchSubmissionsForHire(data.hire.id)
      setSubmissions(subsData || [])
    }

    setLoading(false)
  }, [disputeId])

  useEffect(() => {
    load()
  }, [load])

  // Confirm the connected wallet is actually the contract's admin,
  // so we can warn before wasting gas on a transaction that will revert.
  useEffect(() => {
    if (!account || !isCorrectNetwork) {
      setContractAdmin(null)
      return
    }
    getContractAdmin()
      .then(setContractAdmin)
      .catch(() => setContractAdmin(null))
  }, [account, isCorrectNetwork])

  if (loading) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">{loadError}</div>
        <Link to="/admin/disputes" className="btn btn-outline-secondary btn-sm">
          Back to Disputes
        </Link>
      </div>
    )
  }

  const hire = dispute.hire
  const isOpen = dispute.status === 'open'
  const adminMismatch = account && contractAdmin && account.toLowerCase() !== contractAdmin.toLowerCase()

  async function handleResolve(releaseToFreelancer) {
    const label = releaseToFreelancer ? 'release the payment to the freelancer' : 'refund the client'
    const confirmed = window.confirm(`Are you sure you want to ${label}? This cannot be undone.`)
    if (!confirmed) return

    setTxError('')

    if (!account) {
      setTxError('Connect your wallet first.')
      return
    }
    if (!isCorrectNetwork) {
      setTxError('Switch to the Sepolia network first.')
      return
    }
    if (!hire.escrow_id) {
      setTxError('This hire has no on-chain escrow ID recorded.')
      return
    }

    const recipientAddress = releaseToFreelancer ? hire.freelancer_wallet_address : hire.client_wallet_address

    setResolvingAction(releaseToFreelancer ? 'release' : 'refund')
    setTxStatus('pending')
    setTxHash('')

    let submittedHash = ''

    try {
      const result = await resolveEscrowDispute({
        escrowId: hire.escrow_id,
        releaseToFreelancer,
        onSubmitted: async (hash) => {
          submittedHash = hash
          setTxHash(hash)
          await logPendingTransaction({
            hireId: hire.id,
            txHash: hash,
            fromAddress: CONTRACT_ADDRESS,
            toAddress: recipientAddress,
            amount: hire.amount,
            txType: releaseToFreelancer ? 'release' : 'refund',
          })
        },
      })

      if (result.status !== 'success') {
        await updateTransactionStatus(result.txHash, 'failed')
        setTxStatus('failed')
        setTxError('The transaction did not complete successfully.')
        setResolvingAction(null)
        await load()
        return
      }

      await updateTransactionStatus(result.txHash, 'confirmed')

      const { error: dbError } = await resolveDisputeInDb({
        disputeId: dispute.id,
        hireId: hire.id,
        releaseToFreelancer,
        adminId: user.id,
      })

      if (dbError) {
        setTxStatus('failed')
        setTxError(
          'The dispute was resolved on-chain, but saving it to WorkTrust failed. Save this transaction hash and contact support: ' +
            result.txHash
        )
        setResolvingAction(null)
        return
      }

      setTxStatus('success')
      await load()
    } catch (err) {
      if (submittedHash) {
        await updateTransactionStatus(submittedHash, 'failed')
      }
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setTxStatus('rejected')
      } else {
        setTxStatus('failed')
        setTxError(err.reason || err.message || 'Something went wrong while sending the transaction.')
      }
    } finally {
      setResolvingAction(null)
    }
  }

  return (
    <div className="wt-page" style={{ maxWidth: '720px' }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <h2 className="mb-0">Dispute Details</h2>
        <WalletButton />
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h5 className="card-title">{hire?.job?.title || 'Job'}</h5>
            <span className={`badge ${disputeStatusBadgeClass(dispute.status)} text-capitalize`}>
              {dispute.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-muted small mb-3">
            Raised by {dispute.raiser?.full_name} ({dispute.raiser?.role}) on {formatDate(dispute.created_at)}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{dispute.reason}</p>

          <hr />

          <div className="row">
            <div className="col-sm-6 mb-2">
              <strong>Amount in escrow:</strong> {formatCurrency(hire?.amount)}
            </div>
            <div className="col-sm-6 mb-2">
              <strong>Escrow ID:</strong> #{hire?.escrow_id ?? '—'}
            </div>
            <div className="col-sm-6 mb-2">
              <strong>Client:</strong> {hire?.client?.full_name} ({hire?.client?.email})
              <br />
              <span className="text-muted small">
                {hire?.client_wallet_address ? shortenAddress(hire.client_wallet_address) : 'No wallet on file'}
              </span>
            </div>
            <div className="col-sm-6 mb-2">
              <strong>Freelancer:</strong> {hire?.freelancer?.full_name} ({hire?.freelancer?.email})
              <br />
              <span className="text-muted small">
                {hire?.freelancer_wallet_address
                  ? shortenAddress(hire.freelancer_wallet_address)
                  : 'No wallet on file'}
              </span>
            </div>
          </div>

          {dispute.status !== 'open' && (
            <div className="alert alert-info mb-0">
              Resolved by {dispute.resolver?.full_name || 'an administrator'} on {formatDate(dispute.resolved_at)} —{' '}
              {dispute.status === 'resolved_release' ? 'released to freelancer' : 'refunded to client'}.
            </div>
          )}
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="mb-4">
          <h5>Submitted Work</h5>
          {submissions.map((sub) => (
            <div className="card shadow-sm mb-3" key={sub.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <span className={`badge ${submissionStatusBadgeClass(sub.status)} text-capitalize`}>
                    {sub.status}
                  </span>
                  <span className="text-muted small">{formatDate(sub.created_at)}</span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{sub.message}</p>
                <p className="mb-1">
                  <strong>Project:</strong>{' '}
                  <a href={sub.url} target="_blank" rel="noopener noreferrer">
                    {sub.url}
                  </a>
                </p>
                <p className="mb-0">
                  <strong>GitHub:</strong>{' '}
                  <a href={sub.github_url} target="_blank" rel="noopener noreferrer">
                    {sub.github_url}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Resolve This Dispute</h5>

            {!account && <div className="alert alert-secondary">Connect your wallet above to resolve this dispute.</div>}
            {adminMismatch && (
              <div className="alert alert-warning">
                Connected wallet ({shortenAddress(account)}) is not the contract's admin wallet (
                {shortenAddress(contractAdmin)}). Switch MetaMask to the admin account.
              </div>
            )}
            {txError && <div className="alert alert-danger">{txError}</div>}

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleResolve(true)}
                disabled={resolvingAction !== null || !account || !isCorrectNetwork || adminMismatch}
              >
                {resolvingAction === 'release' ? 'Processing...' : 'Release to Freelancer'}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleResolve(false)}
                disabled={resolvingAction !== null || !account || !isCorrectNetwork || adminMismatch}
              >
                {resolvingAction === 'refund' ? 'Processing...' : 'Refund Client'}
              </button>
            </div>

            <div className="mt-3">
              <TransactionStatus status={txStatus} txHash={txHash} errorMessage="" />
            </div>
          </div>
        </div>
      )}

      <Link to="/admin/disputes" className="btn btn-link mt-3 ps-0">
        &larr; Back to Disputes
      </Link>
    </div>
  )
}

export default AdminDisputeDetails
