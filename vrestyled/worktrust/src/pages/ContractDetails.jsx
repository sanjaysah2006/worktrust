// src/pages/ContractDetails.jsx
//
// General info about the deployed EscrowManager contract, plus a form
// to look up any escrow's on-chain data by its ID.
// Route: /contract

import { useState } from 'react'
import {
  CONTRACT_ADDRESS,
  SEPOLIA_EXPLORER_URL,
  getEscrowOnChain,
  getExplorerAddressUrl,
  shortenAddress,
} from '../lib/blockchain'

function ContractDetails() {
  const [escrowIdInput, setEscrowIdInput] = useState('')
  const [escrow, setEscrow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    setError('')
    setEscrow(null)

    const id = Number(escrowIdInput)
    if (!Number.isInteger(id) || id <= 0) {
      setError('Enter a valid positive escrow ID.')
      return
    }

    setLoading(true)
    try {
      const data = await getEscrowOnChain(id)
      setEscrow(data)
    } catch {
      setError('No escrow found with that ID, or the network could not be reached.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wt-page" style={{ maxWidth: '640px' }}>
      <h2>Contract Details</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <p className="mb-1">
            <strong>Network:</strong> Ethereum Sepolia
          </p>
          <p className="mb-0">
            <strong>Contract address:</strong>{' '}
            <a href={getExplorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer">
              {shortenAddress(CONTRACT_ADDRESS)}
            </a>
          </p>
        </div>
      </div>

      <form onSubmit={handleLookup} className="mb-4" noValidate>
        <label htmlFor="escrowIdInput" className="form-label">
          Look up an escrow by ID
        </label>
        <div className="input-group">
          <input
            id="escrowIdInput"
            type="number"
            min="1"
            className="form-control"
            value={escrowIdInput}
            onChange={(e) => setEscrowIdInput(e.target.value)}
            placeholder="e.g. 1"
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Looking up...
              </>
            ) : (
              'Look up'
            )}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {escrow && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Escrow #{escrow.id}</h5>
            <p className="mb-1">
              <strong>WorkTrust Job ID:</strong> <span className="small">{escrow.jobId}</span>
            </p>
            <p className="mb-1">
              <strong>Client:</strong> {shortenAddress(escrow.client)}
            </p>
            <p className="mb-1">
              <strong>Freelancer:</strong> {shortenAddress(escrow.freelancer)}
            </p>
            <p className="mb-1">
              <strong>Amount:</strong> {escrow.amountEth} ETH
            </p>
            <p className="mb-0">
              <strong>Status:</strong> <span className="badge bg-secondary">{escrow.status}</span>
            </p>
          </div>
        </div>
      )}

      <p className="text-muted small mt-4">
        You can also inspect every transaction directly on{' '}
        <a href={SEPOLIA_EXPLORER_URL} target="_blank" rel="noopener noreferrer">
          Sepolia Etherscan
        </a>
        .
      </p>
    </div>
  )
}

export default ContractDetails
