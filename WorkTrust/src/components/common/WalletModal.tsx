import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Droplets,
  ArrowRightLeft,
  ShieldAlert,
  Zap
} from 'lucide-react';

export const WalletModal: React.FC = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    wallet,
    connectWallet,
    disconnectWallet,
    requestSepoliaFaucet,
    currentUser,
    addToast
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(wallet.network);

  if (!isWalletModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    addToast('Address Copied', 'Wallet address copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Web3 Wallet Connection</h3>
              <p className="text-xs text-slate-400">Non-custodial smart contract interactions</p>
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Status Card if connected */}
          {wallet.isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Connected Wallet</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                  <span className="text-slate-200">{wallet.address}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Balance</span>
                    <span className="text-sm font-bold text-white font-mono">{wallet.balanceEth.toFixed(4)} Sepolia ETH</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Network</span>
                    <span className="text-sm font-semibold text-cyan-400 font-mono">{wallet.network}</span>
                  </div>
                </div>
              </div>

              {/* Network Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono">Switch Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Sepolia Testnet', 'Ethereum Mainnet', 'Arbitrum One'].map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedNetwork(net)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                        selectedNetwork === net
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faucet Action */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sepolia Testnet Faucet</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Claim 1.0 free Sepolia ETH for contract testing</p>
                </div>
                <button
                  onClick={requestSepoliaFaucet}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Claim +1.0 ETH
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href={`https://sepolia.etherscan.io/address/${wallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  <span>View on Etherscan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setIsWalletModalOpen(false);
                  }}
                  className="py-2 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* Connect Wallet Provider Options */
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Select your preferred Web3 provider to interact with smart contract escrows:</p>

              <button
                onClick={() => connectWallet(currentUser.walletAddress)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                    🦊
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">MetaMask</h4>
                    <p className="text-xs text-slate-400">Connect using browser extension</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Connect →</span>
              </button>

              <button
                onClick={() => connectWallet('0x90A131002239B018C442B558C08422A9bA82e48')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                    🔷
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">Coinbase Wallet</h4>
                    <p className="text-xs text-slate-400">Connect via Coinbase mobile or extension</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Connect →</span>
              </button>

              <button
                onClick={() => connectWallet('0x38F1428a9B8018C442B558C08422A9bA82e481B4')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">WalletConnect v2</h4>
                    <p className="text-xs text-slate-400">Scan QR code with mobile Web3 wallet</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Connect →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
