// src/pages/EscrowFunding.jsx
//
// Client view: fund the escrow for a hire with Sepolia test ETH.
// Freelancer/admin view: read-only status of the same escrow.
// Route: /hires/:hireId/fund

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import {
  fetchHireById,
  markHireFunded,
  logPendingTransaction,
  updateTransactionStatus,
  fetchTransactionsForHire,
} from '../lib/escrowApi'
import { fetchSubmissionsForHire } from '../lib/submissionsApi'
import { fetchDisputeByHireId } from '../lib/disputesApi'
import { fundEscrow, shortenAddress, getExplorerTxUrl } from '../lib/blockchain'
import { escrowStatusBadgeClass, submissionStatusBadgeClass, formatCurrency, formatDate } from '../lib/format'
import WalletButton from '../components/WalletButton.jsx'
import TransactionStatus from '../components/TransactionStatus.jsx'

function EscrowFunding() {
  const { hireId } = useParams()
  const { user, profile } = useAuth()
  const { account, isCorrectNetwork } = useWallet()

  const [hire, setHire] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [txStatus, setTxStatus] = useState('idle') // idle | pending | success | rejected | failed
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [isFunding, setIsFunding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    const { data, error } = await fetchHireById(hireId)

    if (error) {
      setLoadError(
        error.code === 'PGRST116'
          ? 'This hire does not exist, or you do not have access to it.'
          : error.message
      )
      setHire(null)
      setLoading(false)
      return
    }

    setHire(data)

    const { data: txData } = await fetchTransactionsForHire(hireId)
    setTransactions(txData || [])

    const { data: subsData } = await fetchSubmissionsForHire(hireId)
    setSubmissions(subsData || [])

    const { data: disputeData } = await fetchDisputeByHireId(hireId)
    setDispute(disputeData || null)

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
  const isFreelancer = user && hire.freelancer_id === user.id
  const isAdmin = profile?.role === 'admin'

  if (!isClient && !isFreelancer && !isAdmin) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">
          You do not have permission to view this escrow.
        </div>
      </div>
    )
  }

  const isPending = hire.escrow_status === 'pending'
  const submission = submissions[0] || null
  // Once funded, always show the addresses that were actually used
  // on-chain (snapshotted on the hire). Before funding, show the
  // freelancer's current profile wallet, since that's what will be used.
  const freelancerAddress = isPending
    ? hire.freelancer?.wallet_address
    : hire.freelancer_wallet_address

  async function handleFund() {
    setTxError('')

    if (!account) {
      setTxError('Connect your wallet first.')
      return
    }
    if (!isCorrectNetwork) {
      setTxError('Switch to the Sepolia network first.')
      return
    }
    if (!freelancerAddress) {
      setTxError('This freelancer has not linked a wallet address yet. Ask them to add one on their Profile page.')
      return
    }
    if (!hire.amount || Number(hire.amount) <= 0) {
      setTxError('This hire does not have a valid agreed amount.')
      return
    }

    // Re-check right before sending, in case this was already funded
    // in another browser tab.
    const { data: latestHire } = await fetchHireById(hireId)
    if (!latestHire || latestHire.escrow_status !== 'pending') {
      setTxError('This escrow was already funded.')
      await load()
      return
    }

    setIsFunding(true)
    setTxStatus('pending')
    setTxHash('')

    let submittedHash = ''

    try {
      const result = await fundEscrow({
        jobId: hire.job_id,
        freelancerAddress,
        amountEth: hire.amount,
        onSubmitted: async (hash) => {
          submittedHash = hash
          setTxHash(hash)
          await logPendingTransaction({
            hireId: hire.id,
            txHash: hash,
            fromAddress: account,
            toAddress: freelancerAddress,
            amount: hire.amount,
            txType: 'fund',
          })
        },
      })

      if (result.status !== 'success' || !result.escrowId) {
        await updateTransactionStatus(result.txHash, 'failed')
        setTxStatus('failed')
        setTxError('The transaction did not complete successfully.')
        setIsFunding(false)
        await load()
        return
      }

      await updateTransactionStatus(result.txHash, 'confirmed')

      const { error: updateError } = await markHireFunded({
        hireId: hire.id,
        escrowId: result.escrowId,
        clientWallet: account,
        freelancerWallet: freelancerAddress,
      })

      if (updateError) {
        setTxStatus('failed')
        setTxError(
          'Payment succeeded on-chain, but saving it to WorkTrust failed. Save this transaction hash and contact support: ' +
            result.txHash
        )
        setIsFunding(false)
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
      setIsFunding(false)
    }
  }

  return (
    <div className="wt-page" style={{ maxWidth: '640px' }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <h2 className="mb-0">Escrow</h2>
        <WalletButton />
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{hire.job?.title || 'Job'}</h5>
          <p className="card-text mb-1">
            <strong>Amount:</strong> {formatCurrency(hire.amount)}
          </p>
          <p className="card-text mb-1">
            <strong>Freelancer wallet:</strong>{' '}
            {freelancerAddress ? shortenAddress(freelancerAddress) : 'Not set yet'}
          </p>
          <p className="card-text mb-1">
            <strong>Status:</strong>{' '}
            <span className={`badge ${escrowStatusBadgeClass(hire.escrow_status)} text-capitalize`}>
              {hire.escrow_status}
            </span>
          </p>
          {hire.escrow_id && (
            <p className="card-text mb-0">
              <strong>Escrow ID:</strong> #{hire.escrow_id}
            </p>
          )}
        </div>
      </div>

      {isPending && isClient && (
        <>
          {!account && <div className="alert alert-secondary">Connect your wallet above to fund this escrow.</div>}

          {!freelancerAddress && (
            <div className="alert alert-warning">
              The freelancer hasn't linked a wallet address yet, so this escrow can't be funded until they do.
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFund}
            disabled={isFunding || !account || !isCorrectNetwork || !freelancerAddress}
          >
            {isFunding ? 'Processing...' : `Fund Escrow (${formatCurrency(hire.amount)})`}
          </button>

          <div className="mt-3">
            <TransactionStatus status={txStatus} txHash={txHash} errorMessage={txError} />
          </div>
        </>
      )}

      {isPending && !isClient && (
        <div className="alert alert-secondary">This escrow has not been funded by the client yet.</div>
      )}

      {hire.escrow_status === 'funded' && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Work Submission</h5>

            {submission ? (
              <>
                <span className={`badge ${submissionStatusBadgeClass(submission.status)} text-capitalize mb-2 d-inline-block`}>
                  Latest submission: {submission.status}
                </span>
                <p className="text-muted small">Submitted {formatDate(submission.created_at)}</p>
              </>
            ) : (
              <p className="text-muted">The freelancer hasn't submitted any work yet.</p>
            )}

            <div className="d-flex gap-2 flex-wrap">
              {isFreelancer && (
                <Link to={`/hires/${hire.id}/submit`} className="btn btn-outline-primary btn-sm">
                  {submission ? 'Submission History / Resubmit' : 'Submit Work'}
                </Link>
              )}
              {isClient && submission && (
                <Link to={`/hires/${hire.id}/review`} className="btn btn-primary btn-sm">
                  Review Submission
                </Link>
              )}
              {(isClient || isFreelancer) && (
                <Link to={`/hires/${hire.id}/dispute`} className="btn btn-outline-danger btn-sm">
                  Raise a Dispute
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {hire.escrow_status === 'disputed' && (
        <div className="alert alert-danger">
          <p className="mb-2">
            <strong>This escrow is disputed.</strong> The funds are locked until an administrator reviews the case.
          </p>
          {dispute?.reason && <p className="mb-2">Reason given: {dispute.reason}</p>}
          {isAdmin && dispute && (
            <Link to={`/admin/disputes/${dispute.id}`} className="btn btn-dark btn-sm">
              Review This Dispute
            </Link>
          )}
        </div>
      )}

      {(hire.escrow_status === 'released' || hire.escrow_status === 'refunded') && (
        <div className="alert alert-success">
          This job's escrow is <strong>{hire.escrow_status}</strong>.
          {transactions[0] && (
            <>
              {' '}
              <a href={getExplorerTxUrl(transactions[0].tx_hash)} target="_blank" rel="noopener noreferrer">
                View transaction
              </a>
            </>
          )}
          {' '}
          <Link to="/transactions">See all transactions</Link>.
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4">
          <h5>Transaction History</h5>
          <ul className="list-group">
            {transactions.map((tx) => (
              <li key={tx.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="text-capitalize fw-semibold">{tx.tx_type}</span>{' '}
                  <span className="text-muted small">{formatDate(tx.created_at)}</span>
                  <br />
                  <a href={getExplorerTxUrl(tx.tx_hash)} target="_blank" rel="noopener noreferrer" className="small">
                    {shortenAddress(tx.tx_hash)}
                  </a>
                </div>
                <span
                  className={`badge text-capitalize ${
                    tx.status === 'confirmed'
                      ? 'bg-success'
                      : tx.status === 'failed'
                      ? 'bg-danger'
                      : 'bg-warning text-dark'
                  }`}
                >
                  {tx.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EscrowFunding
