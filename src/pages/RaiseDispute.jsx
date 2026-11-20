// src/pages/RaiseDispute.jsx
//
// Client or freelancer raises a dispute on a funded escrow. Sends a
// MetaMask transaction that locks the funds on-chain; the database
// dispute record is only created after that transaction is confirmed.
// Route: /hires/:hireId/dispute

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { fetchHireById, logPendingTransaction, updateTransactionStatus } from '../lib/escrowApi'
import { fileDispute } from '../lib/disputesApi'
import { raiseEscrowDispute, CONTRACT_ADDRESS, shortenAddress } from '../lib/blockchain'
import { escrowStatusBadgeClass, formatCurrency } from '../lib/format'
import WalletButton from '../components/WalletButton.jsx'
import TransactionStatus from '../components/TransactionStatus.jsx'

function RaiseDispute() {
  const { hireId } = useParams()
  const { user } = useAuth()
  const { account, isCorrectNetwork } = useWallet()
  const navigate = useNavigate()

  const [hire, setHire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')

  const [txStatus, setTxStatus] = useState('idle')
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    const { data, error } = await fetchHireById(hireId)
    if (error) {
      setLoadError(
        error.code === 'PGRST116' ? 'This hire does not exist, or you do not have access to it.' : error.message
      )
      setLoading(false)
      return
    }
    setHire(data)
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

  if (!isClient && !isFreelancer) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">You do not have permission to raise a dispute on this hire.</div>
      </div>
    )
  }

  const canDispute = hire.escrow_status === 'funded'
  const expectedWallet = isClient ? hire.client_wallet_address : hire.freelancer_wallet_address
  const walletMismatch = account && expectedWallet && account.toLowerCase() !== expectedWallet.toLowerCase()

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setTxError('')

    if (!reason.trim()) {
      setFormError('Please explain the problem.')
      return
    }
    if (!account) {
      setTxError('Connect your wallet first.')
      return
    }
    if (!isCorrectNetwork) {
      setTxError('Switch to the Sepolia network first.')
      return
    }
    if (!expectedWallet) {
      setTxError('No wallet address is on file for this hire yet, so a dispute cannot be raised on-chain.')
      return
    }
    if (walletMismatch) {
      setTxError(
        `Connect the wallet used for this hire (${shortenAddress(expectedWallet)}) to raise a dispute — the contract only accepts a dispute from the client or freelancer wallet on record.`
      )
      return
    }
    if (!hire.escrow_id) {
      setTxError('This hire has no on-chain escrow ID recorded.')
      return
    }

    setIsSubmitting(true)
    setTxStatus('pending')
    setTxHash('')

    let submittedHash = ''

    try {
      const result = await raiseEscrowDispute({
        escrowId: hire.escrow_id,
        onSubmitted: async (hash) => {
          submittedHash = hash
          setTxHash(hash)
          await logPendingTransaction({
            hireId: hire.id,
            txHash: hash,
            fromAddress: account,
            toAddress: CONTRACT_ADDRESS,
            amount: 0,
            txType: 'dispute',
          })
        },
      })

      if (result.status !== 'success') {
        await updateTransactionStatus(result.txHash, 'failed')
        setTxStatus('failed')
        setTxError('The transaction did not complete successfully.')
        setIsSubmitting(false)
        return
      }

      await updateTransactionStatus(result.txHash, 'confirmed')

      const { error: disputeError } = await fileDispute({
        hireId: hire.id,
        raisedBy: user.id,
        reason: reason.trim(),
      })

      if (disputeError) {
        setTxStatus('failed')
        setTxError(
          'The dispute was recorded on-chain, but saving it to WorkTrust failed. Save this transaction hash and contact support: ' +
            result.txHash
        )
        setIsSubmitting(false)
        return
      }

      setTxStatus('success')
      setTimeout(() => navigate(`/hires/${hire.id}/fund`), 1500)
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
      setIsSubmitting(false)
    }
  }

  return (
    <div className="wt-page" style={{ maxWidth: '640px' }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <h2 className="mb-0">Raise a Dispute</h2>
        <WalletButton />
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{hire.job?.title || 'Job'}</h5>
          <p className="card-text mb-1">
            <strong>Amount in escrow:</strong> {formatCurrency(hire.amount)}
          </p>
          <p className="card-text mb-0">
            <strong>Escrow status:</strong>{' '}
            <span className={`badge ${escrowStatusBadgeClass(hire.escrow_status)} text-capitalize`}>
              {hire.escrow_status}
            </span>
          </p>
        </div>
      </div>

      {!canDispute && (
        <div className="alert alert-secondary">
          {hire.escrow_status === 'pending' && 'This escrow has not been funded yet, so there is nothing to dispute.'}
          {hire.escrow_status === 'disputed' && 'A dispute has already been raised and is awaiting admin review.'}
          {(hire.escrow_status === 'released' || hire.escrow_status === 'refunded') &&
            'This hire is already closed and can no longer be disputed.'}
        </div>
      )}

      {canDispute && (
        <form onSubmit={handleSubmit} noValidate className="card shadow-sm">
          <div className="card-body">
            <p className="text-muted small">
              Raising a dispute locks the escrowed funds until an administrator reviews the case and releases the
              payment to the freelancer or refunds the client.
            </p>

            {!account && <div className="alert alert-secondary">Connect your wallet above to raise a dispute.</div>}
            {walletMismatch && (
              <div className="alert alert-warning">
                Connected wallet doesn't match the one on file for this hire ({shortenAddress(expectedWallet)}).
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="reason" className="form-label">
                What's wrong?
              </label>
              <textarea
                id="reason"
                rows="5"
                className={`form-control ${formError ? 'is-invalid' : ''}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
              {formError && <div className="invalid-feedback">{formError}</div>}
            </div>

            {txError && <div className="alert alert-danger">{txError}</div>}

            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting || !account || !isCorrectNetwork || walletMismatch}
            >
              {isSubmitting ? 'Processing...' : 'Raise Dispute'}
            </button>

            <div className="mt-3">
              <TransactionStatus status={txStatus} txHash={txHash} errorMessage="" />
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default RaiseDispute
