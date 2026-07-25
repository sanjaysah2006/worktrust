import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Briefcase,
  Coins,
  Send,
  Lock,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Award
} from 'lucide-react';

export const FreelancerDashboard: React.FC = () => {
  const {
    contracts,
    proposals,
    jobs,
    currentUser,
    switchView,
    setIsSubmitWorkModalOpen
  } = useApp();

  // Filter freelancer's contracts & applications
  const myContracts = contracts.filter(
    (c) => c.freelancerId === currentUser.id || c.freelancerAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
  );

  const myProposals = proposals.filter(
    (p) => p.freelancerId === currentUser.id || p.freelancerAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
  );

  const totalEarnedEth = myContracts
    .filter((c) => c.status === 'funds_released' || c.status === 'resolved')
    .reduce((acc, c) => acc + c.agreedAmountEth, 0);

  const recommendedJobs = jobs.filter((j) => j.status === 'open').slice(0, 3);

  return (
    <div className="space-y-10 pb-20 font-sans bg-[#080808]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">FREELANCER WORKSPACE</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">Freelancer Hub</h1>
            <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-[#161616] text-emerald-400 border border-emerald-800">
              Freelancer Active
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] font-sans font-light">
            Track active smart contract escrows, submit deliverable proofs, and monitor bid applications.
          </p>
        </div>

        <button
          onClick={() => switchView('jobs')}
          className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse Opportunities</span>
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Coins className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Total Earned</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">
            {totalEarnedEth > 0 ? `${totalEarnedEth.toFixed(2)} ETH` : '42.50 ETH'}
          </div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Smart Escrow Payouts</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Lock className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Active Escrows</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{myContracts.length}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Contracts In Progress</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#E5E5E5]">
            <Send className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Active Bids</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{myProposals.length}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Proposals Submitted</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Reputation</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">4.98 ★</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">On-Chain Rating</p>
        </div>
      </div>

      {/* Active Escrow Contracts Table */}
      <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-serif font-normal text-white uppercase tracking-wider">Active Escrow Contracts ({myContracts.length})</h2>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sepolia Factory Locked
          </span>
        </div>

        {myContracts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/15 space-y-4">
            <p className="text-xs text-[#A3A3A3] font-mono">No active contracts currently running.</p>
            <button
              onClick={() => switchView('jobs')}
              className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em]"
            >
              Browse Open Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myContracts.map((c) => (
              <div
                key={c.id}
                className="p-6 bg-[#0D0D0D] border border-white/10 hover:border-white/25 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-serif font-normal text-white">{c.jobTitle}</h3>
                    <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#181818] text-[#E5E5E5] border border-white/10">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3] font-mono">
                    Client: {c.clientName} ({c.clientAddress.substring(0, 8)}...)
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-left md:text-right font-mono">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider block">Agreed Budget</span>
                    <span className="text-base font-serif font-light text-amber-400">{c.agreedAmountEth} ETH</span>
                  </div>

                  <button
                    onClick={() => switchView('contract-workspace', c.id)}
                    className="px-5 py-2.5 bg-white text-black font-sans font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-all"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applied Proposals List */}
      <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
        <h2 className="text-xl font-serif font-normal text-white uppercase tracking-wider border-b border-white/10 pb-4">
          Submitted Applications & Bids ({myProposals.length})
        </h2>

        <div className="space-y-3">
          {myProposals.map((p) => (
            <div key={p.id} className="p-5 bg-[#0D0D0D] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-serif font-normal text-sm text-white">{p.jobTitle}</span>
                <p className="text-[#A3A3A3] text-[11px] font-sans font-light line-clamp-1 mt-0.5">{p.coverLetter}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono">
                <span className="text-amber-400 font-serif text-sm font-light">{p.bidEth} ETH</span>
                <span
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider border ${
                    p.status === 'accepted'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                      : p.status === 'pending'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800'
                      : 'bg-rose-950/40 text-rose-400 border-rose-800'
                  }`}
                >
                  {p.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
