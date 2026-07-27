// src/pages/ReviewSubmission.jsx
//
// Client reviews the freelancer's latest submission. Approving sends a
// MetaMask transaction that releases the escrow payment on-chain;
// the database is only updated after that transaction is confirmed.
// Route: /hires/:hireId/review

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { fetchHireById, markHireReleased, logPendingTransaction, updateTransactionStatus } from '../lib/escrowApi'
import { fetchSubmissionsForHire, approveSubmission, rejectSubmission } from '../lib/submissionsApi'
import { releaseEscrowPayment, CONTRACT_ADDRESS, shortenAddress, getExplorerTxUrl } from '../lib/blockchain'
import { escrowStatusBadgeClass, submissionStatusBadgeClass, formatCurrency, formatDate } from '../lib/format'
import WalletButton from '../components/WalletButton.jsx'
import TransactionStatus from '../components/TransactionStatus.jsx'

function ReviewSubmission() {
  const { hireId } = useParams()
  const { user } = useAuth()
  const { account, isCorrectNetwork } = useWallet()

  const [hire, setHire] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [txStatus, setTxStatus] = useState('idle')
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [isApproving, setIsApproving] = useState(false)

  const [rejecting, setRejecting] = useState(false)
  const [rejectError, setRejectError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    const { data: hireData, error: hireError } = await fetchHireById(hireId)
    if (hireError) {
      setLoadError(
        hireError.code === 'PGRST116'
          ? 'This hire does not exist, or you do not have access to it.'
          : hireError.message
      )
      setLoading(false)
      return
    }
    setHire(hireData)

    const { data: subsData, error: subsError } = await fetchSubmissionsForHire(hireId)
    if (subsError) {
      setLoadError(subsError.message)
      setLoading(false)
      return
    }
    setSubmissions(subsData || [])
    setLoading(false)
  }, [hireId])

  useEffect(() => {
    load()
  }, [load])

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
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const isClient = user && hire.client_id === user.id

  if (!isClient) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">You do not have permission to review this submission.</div>
      </div>
    )
  }

  const pendingSubmission = submissions.find((sub) => sub.status === 'submitted') || null
  const canReview = hire.escrow_status === 'funded' && pendingSubmission

  async function handleApprove() {
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
      setTxError('This hire has no on-chain escrow ID recorded, cannot release payment.')
      return
    }

    setIsApproving(true)
    setTxStatus('pending')
    setTxHash('')

    let submittedHash = ''

    try {
      const result = await releaseEscrowPayment({
        escrowId: hire.escrow_id,
        onSubmitted: async (hash) => {
          submittedHash = hash
          setTxHash(hash)
          await logPendingTransaction({
            hireId: hire.id,
            txHash: hash,
            fromAddress: CONTRACT_ADDRESS,
            toAddress: hire.freelancer_wallet_address,
            amount: hire.amount,
            txType: 'release',
          })
        },
      })

      if (result.status !== 'success') {
        await updateTransactionStatus(result.txHash, 'failed')
        setTxStatus('failed')
        setTxError('The transaction did not complete successfully.')
        setIsApproving(false)
        await load()
        return
      }

      await updateTransactionStatus(result.txHash, 'confirmed')
      await approveSubmission(pendingSubmission.id)

      const { error: hireUpdateError } = await markHireReleased(hire.id)
      if (hireUpdateError) {
        setTxStatus('failed')
        setTxError(
          'Payment was released on-chain, but saving it to WorkTrust failed. Save this transaction hash and contact support: ' +
            result.txHash
        )
        setIsApproving(false)
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
      setIsApproving(false)
    }
  }

  async function handleReject() {
    const confirmed = window.confirm('Reject this submission and ask the freelancer to resubmit?')
    if (!confirmed) return

    setRejectError('')
    setRejecting(true)
    const { error } = await rejectSubmission(pendingSubmission.id)
    setRejecting(false)

    if (error) {
      setRejectError(error.message)
      return
    }

    await load()
  }

  return (
    <div className="wt-page" style={{ maxWidth: '640px' }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <h2 className="mb-0">Review Submission</h2>
        <WalletButton />
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{hire.job?.title || 'Job'}</h5>
          <p className="card-text mb-1">
            <strong>Amount to release:</strong> {formatCurrency(hire.amount)}
          </p>
          <p className="card-text mb-1">
            <strong>Freelancer:</strong> {hire.freelancer?.full_name}{' '}
            {hire.freelancer_wallet_address && `(${shortenAddress(hire.freelancer_wallet_address)})`}
          </p>
          <p className="card-text mb-0">
            <strong>Escrow status:</strong>{' '}
            <span className={`badge ${escrowStatusBadgeClass(hire.escrow_status)} text-capitalize`}>
              {hire.escrow_status}
            </span>
          </p>
        </div>
      </div>

      {!pendingSubmission && hire.escrow_status === 'funded' && (
        <div className="alert alert-secondary">The freelancer hasn't submitted any work for review yet.</div>
      )}

      {hire.escrow_status !== 'funded' && (
        <div className="alert alert-secondary">
          {hire.escrow_status === 'pending' && 'Fund the escrow before work can be reviewed.'}
          {hire.escrow_status === 'disputed' && 'This hire is under dispute. Wait for an administrator to resolve it.'}
          {(hire.escrow_status === 'released' || hire.escrow_status === 'refunded') && 'This hire is already closed.'}
        </div>
      )}

      {canReview && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
              <span className={`badge ${submissionStatusBadgeClass(pendingSubmission.status)} text-capitalize`}>
                {pendingSubmission.status}
              </span>
              <span className="text-muted small">{formatDate(pendingSubmission.created_at)}</span>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{pendingSubmission.message}</p>
            <p className="mb-1">
              <strong>Project:</strong>{' '}
              <a href={pendingSubmission.url} target="_blank" rel="noopener noreferrer">
                {pendingSubmission.url}
              </a>
            </p>
            <p className="mb-3">
              <strong>GitHub:</strong>{' '}
              <a href={pendingSubmission.github_url} target="_blank" rel="noopener noreferrer">
                {pendingSubmission.github_url}
              </a>
            </p>

            {!account && <div className="alert alert-secondary">Connect your wallet above to approve this work.</div>}
            {txError && <div className="alert alert-danger">{txError}</div>}
            {rejectError && <div className="alert alert-danger">{rejectError}</div>}

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleApprove}
                disabled={isApproving || rejecting || !account || !isCorrectNetwork}
              >
                {isApproving ? 'Processing...' : `Approve & Release ${formatCurrency(hire.amount)}`}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleReject}
                disabled={isApproving || rejecting}
              >
                {rejecting ? 'Processing...' : 'Reject & Ask to Resubmit'}
              </button>
            </div>

            <div className="mt-3">
              <TransactionStatus status={txStatus} txHash={txHash} errorMessage="" />
            </div>
          </div>
        </div>
      )}

      {submissions.length > 0 && (
        <div>
          <h5>All Submissions</h5>
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
                {txHash && sub.id === pendingSubmission?.id && (
                  <p className="mt-2 mb-0">
                    <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer" className="small">
                      View release transaction
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewSubmission
