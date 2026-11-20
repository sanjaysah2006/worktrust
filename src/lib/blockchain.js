// src/lib/blockchain.js
//
// All direct Ethers.js / MetaMask logic lives in this one file so the rest
// of the app never has to import "ethers" directly.

import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther } from 'ethers'

// ---------------------------------------------------------------------
// Contract configuration
// ---------------------------------------------------------------------

export const CONTRACT_ADDRESS = '0xC3B5530C51AD7D50D52f855dE14dA2684F2d38d5'

export const SEPOLIA_CHAIN_ID = 11155111
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'
export const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io'
// Public RPC endpoint used only for read-only contract calls, so that
// looking up an escrow works even if MetaMask is on the wrong network
// (or not installed at all) — see getReadOnlyContract() below.
export const SEPOLIA_RPC_URL = 'https://rpc.sepolia.org'

// Matches the Status enum in EscrowManager.sol:
// 0 = Funded, 1 = Released, 2 = Disputed, 3 = Refunded
export const ESCROW_STATUS_LABELS = ['Funded', 'Released', 'Disputed', 'Refunded']

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'jobId', type: 'uint256' },
      { internalType: 'address', name: 'freelancerAddress', type: 'address' },
    ],
    name: 'createEscrow',
    outputs: [{ internalType: 'uint256', name: 'escrowId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'raisedBy', type: 'address' },
    ],
    name: 'DisputeRaised',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'releasedToFreelancer', type: 'bool' },
      { indexed: true, internalType: 'address', name: 'resolvedBy', type: 'address' },
    ],
    name: 'DisputeResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'jobId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'client', type: 'address' },
      { indexed: false, internalType: 'address', name: 'freelancer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'EscrowCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'freelancer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PaymentReleased',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'escrowId', type: 'uint256' }],
    name: 'raiseDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'escrowId', type: 'uint256' }],
    name: 'releasePayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { internalType: 'bool', name: 'releaseToFreelancer', type: 'bool' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'fallback' },
  { stateMutability: 'payable', type: 'receive' },
  {
    inputs: [],
    name: 'admin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'escrowCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'escrowId', type: 'uint256' }],
    name: 'getEscrow',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'jobId', type: 'uint256' },
      { internalType: 'address', name: 'client', type: 'address' },
      { internalType: 'address', name: 'freelancer', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'enum EscrowManager.Status', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

// ---------------------------------------------------------------------
// WorkTrust job IDs are Postgres UUIDs, but the contract's jobId
// parameter is a uint256. These two helpers convert between them so
// the rest of the app never has to think about it: a UUID's 32 hex
// characters (with the dashes removed) fit inside a uint256 exactly.
// ---------------------------------------------------------------------

export function jobIdToUint256(jobId) {
  const hex = String(jobId).replace(/-/g, '')
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error('This job ID is not a valid UUID, cannot convert it for the contract.')
  }
  return BigInt('0x' + hex)
}

export function uint256ToJobId(value) {
  const hex = BigInt(value).toString(16).padStart(32, '0')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

// ---------------------------------------------------------------------
// MetaMask / provider helpers
// ---------------------------------------------------------------------

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

// Creates a fresh Ethers v6 BrowserProvider wrapping window.ethereum.
export function getProvider() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Install it from https://metamask.io')
  }
  return new BrowserProvider(window.ethereum)
}

// Opens the MetaMask "connect" popup and returns the approved accounts.
export async function requestAccounts() {
  const provider = getProvider()
  return provider.send('eth_requestAccounts', [])
}

// Reads already-approved accounts without opening a popup.
export async function getApprovedAccounts() {
  if (!isMetaMaskInstalled()) return []
  return window.ethereum.request({ method: 'eth_accounts' })
}

export async function getCurrentChainId() {
  const provider = getProvider()
  const network = await provider.getNetwork()
  return Number(network.chainId)
}

// Asks MetaMask to switch to Sepolia, adding it first if the user has
// never used that network in MetaMask before.
export async function switchToSepolia() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.')
  }
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    })
  } catch (switchError) {
    // 4902 = this chain has not been added to the user's MetaMask yet
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: [SEPOLIA_EXPLORER_URL],
          },
        ],
      })
    } else {
      throw switchError
    }
  }
}

export async function getSigner() {
  const provider = getProvider()
  return provider.getSigner()
}

// Contract instance that can send transactions (needs a connected signer).
export async function getWritableContract() {
  const signer = await getSigner()
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

// Contract instance for read-only calls (looking up an escrow, reading
// the admin address). Deliberately does NOT use MetaMask's provider:
// if MetaMask happened to be connected to the wrong network, reads
// would silently target the wrong chain. A direct Sepolia RPC
// connection also means lookups work even without MetaMask installed.
export function getReadOnlyContract() {
  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL)
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

export function onAccountsChanged(callback) {
  if (!isMetaMaskInstalled()) return () => {}
  window.ethereum.on('accountsChanged', callback)
  return () => window.ethereum.removeListener('accountsChanged', callback)
}

export function onChainChanged(callback) {
  if (!isMetaMaskInstalled()) return () => {}
  window.ethereum.on('chainChanged', callback)
  return () => window.ethereum.removeListener('chainChanged', callback)
}

// ---------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------

export function shortenAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getExplorerTxUrl(txHash) {
  return `${SEPOLIA_EXPLORER_URL}/tx/${txHash}`
}

export function getExplorerAddressUrl(address) {
  return `${SEPOLIA_EXPLORER_URL}/address/${address}`
}

// ---------------------------------------------------------------------
// Contract interactions
// ---------------------------------------------------------------------

/**
 * Client funds a new escrow for a job.
 * `onSubmitted(txHash)` fires as soon as MetaMask returns a transaction
 * hash (before it's mined), so the caller can save a "pending" record
 * right away.
 */
export async function fundEscrow({ jobId, freelancerAddress, amountEth, onSubmitted }) {
  const contract = await getWritableContract()
  const value = parseEther(String(amountEth))
  const numericJobId = jobIdToUint256(jobId)

  const tx = await contract.createEscrow(numericJobId, freelancerAddress, { value })

  if (onSubmitted) {
    onSubmitted(tx.hash)
  }

  const receipt = await tx.wait()

  // Read the escrowId back out of the EscrowCreated event.
  let escrowId = null
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log)
      if (parsedLog && parsedLog.name === 'EscrowCreated') {
        escrowId = parsedLog.args.escrowId.toString()
        break
      }
    } catch {
      // log from a different contract/event, safe to skip
    }
  }

  return {
    txHash: receipt.hash,
    escrowId,
    status: receipt.status === 1 ? 'success' : 'failed',
  }
}

// Reads one escrow's current on-chain data.
export async function getEscrowOnChain(escrowId) {
  const contract = getReadOnlyContract()
  const result = await contract.getEscrow(escrowId)
  return {
    id: result[0].toString(),
    jobId: uint256ToJobId(result[1]),
    client: result[2],
    freelancer: result[3],
    amountEth: formatEther(result[4]),
    status: ESCROW_STATUS_LABELS[Number(result[5])],
  }
}

// Reads the admin address set in the contract's constructor. Used to
// warn an administrator if they've connected the wrong wallet.
export async function getContractAdmin() {
  const contract = getReadOnlyContract()
  return contract.admin()
}

/**
 * Client approves submitted work: releases the escrowed amount to the
 * freelancer. Only the client's wallet can call this (enforced by the
 * contract itself).
 */
export async function releaseEscrowPayment({ escrowId, onSubmitted }) {
  const contract = await getWritableContract()
  const tx = await contract.releasePayment(escrowId)

  if (onSubmitted) {
    onSubmitted(tx.hash)
  }

  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    status: receipt.status === 1 ? 'success' : 'failed',
  }
}

/**
 * Client or freelancer raises a dispute on a funded escrow. Only the
 * two wallets involved in that escrow can call this (enforced by the
 * contract itself). Locks the funds until an admin resolves it.
 */
export async function raiseEscrowDispute({ escrowId, onSubmitted }) {
  const contract = await getWritableContract()
  const tx = await contract.raiseDispute(escrowId)

  if (onSubmitted) {
    onSubmitted(tx.hash)
  }

  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    status: receipt.status === 1 ? 'success' : 'failed',
  }
}

/**
 * Administrator resolves a dispute: releases to the freelancer or
 * refunds the client. Only the contract's admin wallet can call this.
 */
export async function resolveEscrowDispute({ escrowId, releaseToFreelancer, onSubmitted }) {
  const contract = await getWritableContract()
  const tx = await contract.resolveDispute(escrowId, releaseToFreelancer)

  if (onSubmitted) {
    onSubmitted(tx.hash)
  }

  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    status: receipt.status === 1 ? 'success' : 'failed',
  }
}
