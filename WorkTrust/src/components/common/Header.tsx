import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  UserCheck,
  Gavel,
  History,
  Wallet,
  Droplets,
  Settings,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    switchView,
    currentUser,
    switchUserRole,
    wallet,
    setIsWalletModalOpen,
    requestSepoliaFaucet,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080808]/95 backdrop-blur-md">
      {/* Top Banner for Testnet & Quick Role Switching */}
      <div className="bg-[#0D0D0D] border-b border-white/5 py-2 px-4 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[#A3A3A3]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#E5E5E5]">
              Network: <strong className="text-emerald-400 font-semibold">{wallet.network}</strong>
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#A3A3A3] text-[10px] font-mono tracking-[0.1em] uppercase">
              Smart Contract Escrow v2.4 Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={requestSepoliaFaucet}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 hover:border-cyan-400 transition-colors"
              title="Get 1.0 free Sepolia ETH for testing escrow flows"
            >
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Get +1.0 Sepolia ETH</span>
            </button>

            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-md border border-white/10">
              <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#A3A3A3] px-2">Role:</span>
              <button
                onClick={() => switchUserRole('client')}
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] rounded transition-all ${
                  currentUser.role === 'client'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => switchUserRole('freelancer')}
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] rounded transition-all ${
                  currentUser.role === 'freelancer'
                    ? 'bg-emerald-400 text-black font-bold shadow-sm'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Freelancer
              </button>
              <button
                onClick={() => switchUserRole('admin')}
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] rounded transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-400 text-black font-bold shadow-sm'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => switchView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-white/30 bg-[#121212] group-hover:border-white transition-all">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl tracking-[0.2em] font-serif font-light text-white uppercase">
                  Work<span className="font-semibold italic">Trust</span>
                </span>
                <span className="px-2 py-0.5 border border-white/20 text-[9px] font-mono text-[#A3A3A3] uppercase tracking-[0.2em]">
                  v2.4
                </span>
              </div>
              <p className="text-[9px] text-[#A3A3A3] font-mono uppercase tracking-[0.3em] -mt-0.5">
                DECENTRALIZED ESCROW
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121212] p-1.5 rounded-full border border-white/10">
            <button
              onClick={() => switchView('jobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                currentView === 'jobs' || currentView === 'job-detail'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Find Work</span>
            </button>

            <button
              onClick={() => switchView('post-job')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                currentView === 'post-job'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Opportunity</span>
            </button>

            {currentUser.role === 'client' && (
              <button
                onClick={() => switchView('client-dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                  currentView === 'client-dashboard'
                    ? 'bg-white text-black font-semibold shadow'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Client Hub</span>
              </button>
            )}

            {currentUser.role === 'freelancer' && (
              <button
                onClick={() => switchView('freelancer-dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                  currentView === 'freelancer-dashboard'
                    ? 'bg-white text-black font-semibold shadow'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Freelancer Hub</span>
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => switchView('admin-disputes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                  currentView === 'admin-disputes'
                    ? 'bg-purple-400 text-black font-semibold shadow'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Court</span>
              </button>
            )}

            <button
              onClick={() => switchView('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-[0.15em] transition-all ${
                currentView === 'transactions'
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Explorer</span>
            </button>
          </nav>

          {/* Web3 Wallet & User Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchView('settings')}
              className="p-2.5 text-[#A3A3A3] hover:text-white hover:bg-white/5 rounded-full border border-transparent hover:border-white/10 transition-colors"
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>

            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="text-xs font-semibold text-white font-mono flex items-center gap-1.5">
                    <span>{wallet.balanceEth.toFixed(2)} Sepolia ETH</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-[#A3A3A3] font-mono tracking-wider">
                    ≈ ${(wallet.balanceEth * 2850).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>

                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#141414] border border-white/20 hover:border-white text-[#E5E5E5] text-xs font-mono transition-all group"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping"></div>
                  <span>
                    {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white bg-[#121212] hover:bg-white hover:text-black text-white font-sans text-[11px] uppercase tracking-[0.2em] transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
