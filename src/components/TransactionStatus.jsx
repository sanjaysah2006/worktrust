// src/components/TransactionStatus.jsx
//
// Reusable status banner for a blockchain transaction.
// status: 'idle' | 'pending' | 'success' | 'rejected' | 'failed'

import { getExplorerTxUrl } from '../lib/blockchain'

const STATUS_CONFIG = {
  pending: {
    className: 'alert-info',
    label: 'Transaction pending — confirm in MetaMask, then wait for it to be mined...',
    showSpinner: true,
  },
  success: {
    className: 'alert-success',
    label: 'Transaction successful.',
    showSpinner: false,
  },
  rejected: {
    className: 'alert-warning',
    label: 'Transaction was rejected in MetaMask.',
    showSpinner: false,
  },
  failed: {
    className: 'alert-danger',
    label: 'Transaction failed.',
    showSpinner: false,
  },
}

function TransactionStatus({ status, txHash, errorMessage }) {
  if (!status || status === 'idle') return null

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.failed

  return (
    <div className={`alert ${config.className} d-flex align-items-start gap-2`} role="alert">
      {config.showSpinner && (
        <span className="spinner-border spinner-border-sm mt-1" role="status" aria-hidden="true"></span>
      )}
      <div>
        <div>{config.label}</div>
        {errorMessage && <small className="d-block mt-1">{errorMessage}</small>}
        {txHash && (
          <small className="d-block mt-1">
            <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer">
              View transaction on Sepolia Etherscan
            </a>
          </small>
        )}
      </div>
    </div>
  )
}

export default TransactionStatus
