// src/pages/TransactionHistory.jsx
//
// Every blockchain transaction the current user is allowed to see
// (their own hires as client/freelancer, or all of them for an admin).
// Route: /transactions

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyTransactions } from '../lib/escrowApi'
import { getExplorerTxUrl, shortenAddress } from '../lib/blockchain'
import { formatCurrency, formatDate } from '../lib/format'
import EmptyState from '../components/EmptyState.jsx'

function txTypeBadgeClass(type) {
  switch (type) {
    case 'fund':
      return 'bg-primary'
    case 'release':
      return 'bg-success'
    case 'refund':
      return 'bg-info text-dark'
    case 'dispute':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

function txStatusBadgeClass(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-success'
    case 'failed':
      return 'bg-danger'
    default:
      return 'bg-warning text-dark'
  }
}

function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await fetchMyTransactions()

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setTransactions(data || [])
      }
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="wt-page">
      <div className="wt-page-header">
        <h2>Transaction History</h2>
      </div>

      {loading && (
        <div className="wt-spinner-wrap">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading transactions…</span>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          Could not load transactions: {error}
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <EmptyState
          icon="wallet"
          title="No transactions yet"
          message="Blockchain transactions from funding, releasing, or refunding escrow will show up here."
        />
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    {tx.hire ? (
                      <Link to={`/hires/${tx.hire.id}/fund`}>{tx.hire.job?.title || 'Job'}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className={`badge ${txTypeBadgeClass(tx.tx_type)} text-capitalize`}>{tx.tx_type}</span>
                  </td>
                  <td>{formatCurrency(tx.amount)}</td>
                  <td className="small" title={tx.from_address}>
                    {shortenAddress(tx.from_address)}
                  </td>
                  <td className="small" title={tx.to_address}>
                    {shortenAddress(tx.to_address)}
                  </td>
                  <td>
                    <span className={`badge ${txStatusBadgeClass(tx.status)} text-capitalize`}>{tx.status}</span>
                  </td>
                  <td className="small text-muted">{formatDate(tx.created_at)}</td>
                  <td>
                    <a href={getExplorerTxUrl(tx.tx_hash)} target="_blank" rel="noopener noreferrer" className="small">
                      Etherscan
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory
