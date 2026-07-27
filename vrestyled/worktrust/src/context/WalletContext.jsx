// src/context/WalletContext.jsx
//
// Keeps wallet connection state (account, network) in one place so every
// page and component sees the same state, and account/network changes
// made directly in MetaMask are picked up automatically everywhere.

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import {
  isMetaMaskInstalled,
  requestAccounts,
  getApprovedAccounts,
  getCurrentChainId,
  switchToSepolia,
  onAccountsChanged,
  onChainChanged,
  SEPOLIA_CHAIN_ID,
} from '../lib/blockchain'

const WalletContext = createContext(undefined)

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID

  const refreshChainId = useCallback(async () => {
    try {
      const id = await getCurrentChainId()
      setChainId(id)
    } catch {
      setChainId(null)
    }
  }, [])

  const connect = useCallback(async () => {
    setError('')
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Install the MetaMask browser extension first.')
      return
    }
    setIsConnecting(true)
    try {
      const accounts = await requestAccounts()
      setAccount(accounts[0] || null)
      await refreshChainId()
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection request was rejected.')
      } else {
        setError(err.message || 'Failed to connect wallet.')
      }
    } finally {
      setIsConnecting(false)
    }
  }, [refreshChainId])

  const switchNetwork = useCallback(async () => {
    setError('')
    try {
      await switchToSepolia()
      await refreshChainId()
    } catch (err) {
      if (err.code === 4001) {
        setError('Network switch was rejected.')
      } else {
        setError(err.message || 'Failed to switch network.')
      }
    }
  }, [refreshChainId])

  // On page load, silently pick up an already-approved connection.
  useEffect(() => {
    if (!isMetaMaskInstalled()) return
    getApprovedAccounts().then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0])
        refreshChainId()
      }
    })
  }, [refreshChainId])

  // Stay in sync with changes made directly inside MetaMask.
  useEffect(() => {
    const unsubscribeAccounts = onAccountsChanged((accounts) => {
      setAccount(accounts.length > 0 ? accounts[0] : null)
    })
    const unsubscribeChain = onChainChanged(() => {
      refreshChainId()
    })
    return () => {
      unsubscribeAccounts()
      unsubscribeChain()
    }
  }, [refreshChainId])

  const value = {
    account,
    chainId,
    isCorrectNetwork,
    isConnecting,
    error,
    connect,
    switchNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used inside a <WalletProvider>')
  }
  return context
}
