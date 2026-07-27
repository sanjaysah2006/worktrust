// src/components/WalletButton.jsx
//
// Shows "Connect Wallet", then a shortened address once connected, and
// warns (with a one-click fix) if the user is on the wrong network.
// Designed to sit inside the dark navbar.

import { useWallet } from '../context/WalletContext.jsx'
import { shortenAddress } from '../lib/blockchain'

function WalletButton() {
  const { account, isCorrectNetwork, isConnecting, error, connect, switchNetwork } = useWallet()

  if (!account) {
    return (
      <div className="d-flex flex-column align-items-lg-end">
        <button
          type="button"
          className="btn btn-outline-light btn-sm"
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
        {error && <small className="text-warning mt-1">{error}</small>}
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="d-flex flex-column align-items-lg-end">
        <button type="button" className="btn btn-warning btn-sm" onClick={switchNetwork}>
          Wrong network — Switch to Sepolia
        </button>
        {error && <small className="text-warning mt-1">{error}</small>}
      </div>
    )
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="badge bg-success">Sepolia</span>
      <span className="badge bg-light text-dark" title={account}>
        {shortenAddress(account)}
      </span>
    </div>
  )
}

export default WalletButton
