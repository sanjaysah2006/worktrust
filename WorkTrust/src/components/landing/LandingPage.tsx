import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Zap,
  ArrowRight,
  PlusCircle,
  Briefcase,
  CheckCircle2,
  FileCode2,
  Gavel,
  Coins,
  Sparkles,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchView, jobs, switchUserRole } = useApp();

  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-20 pb-24 font-sans bg-[#080808]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          {/* Web3 Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] border border-white/20 text-[#E5E5E5] text-[10px] font-mono uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Decentralized Escrow v2.4 Active on Sepolia</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-tight leading-tight uppercase">
              Freelance with Eternal Trust.{' '}
              <span className="block italic font-serif font-normal text-white/90">
                Payments Guaranteed On-Chain.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#A3A3A3] max-w-2xl mx-auto font-sans font-light leading-relaxed tracking-wide">
              WorkTrust eliminates intermediary default risks using non-custodial smart contracts. Clients commit ETH into automated escrow vaults, releasing funds upon verified milestone fulfillment.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => switchView('jobs')}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-neutral-200 font-sans font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Work</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => switchView('post-job')}
              className="flex items-center gap-3 px-8 py-4 bg-[#121212] border border-white/30 hover:border-white text-white font-sans font-semibold text-xs uppercase tracking-[0.2em] transition-all"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Post Opportunity</span>
            </button>
          </div>

          {/* Key Metric Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-6 bg-[#121212] border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#666]">TVL</span>
              </div>
              <div className="text-2xl font-serif font-light text-white tracking-tight">1,480 ETH</div>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Locked In Escrow</p>
            </div>

            <div className="p-6 bg-[#121212] border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <Lock className="w-4 h-4" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#666]">Contracts</span>
              </div>
              <div className="text-2xl font-serif font-light text-white tracking-tight">1,420+</div>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Smart Escrows</p>
            </div>

            <div className="p-6 bg-[#121212] border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-purple-400">
                <Gavel className="w-4 h-4" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#666]">Settlement</span>
              </div>
              <div className="text-2xl font-serif font-light text-white tracking-tight">99.8%</div>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Dispute Resolution</p>
            </div>

            <div className="p-6 bg-[#121212] border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#666]">Fee</span>
              </div>
              <div className="text-2xl font-serif font-light text-white tracking-tight">0% Fee</div>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Direct Vaults</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Escrow Flowchart Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">ARCHITECTURAL WORKFLOW</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
            How Smart Escrow Works
          </h2>
          <p className="text-xs text-[#A3A3A3] max-w-xl mx-auto font-mono tracking-wide uppercase">
            Deterministic code execution replacing corporate payment middleman delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-8 bg-[#121212] border border-white/10 relative space-y-4 hover:border-white/40 transition-all group">
            <div className="text-xs font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">
              01 // AGREEMENT
            </div>
            <h3 className="text-base font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
              Opportunity Creation
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              Clients define project deliverables, milestone budgets in ETH, and cryptographic proof standards directly on-chain.
            </p>
          </div>

          <div className="p-8 bg-[#121212] border border-white/10 relative space-y-4 hover:border-white/40 transition-all group">
            <div className="text-xs font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">
              02 // VAULTING
            </div>
            <h3 className="text-base font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
              Escrow Funding
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              Upon awarding a proposal, project funds lock immediately into an immutable non-custodial smart contract vault.
            </p>
          </div>

          <div className="p-8 bg-[#121212] border border-white/10 relative space-y-4 hover:border-white/40 transition-all group">
            <div className="text-xs font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">
              03 // SUBMISSION
            </div>
            <h3 className="text-base font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
              Deliverable Proof
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              Freelancers attach code commit hashes, IPFS file links, or deployment proofs, stamping submission on-chain.
            </p>
          </div>

          <div className="p-8 bg-[#121212] border border-white/10 relative space-y-4 hover:border-white/40 transition-all group">
            <div className="text-xs font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">
              04 // RELEASE
            </div>
            <h3 className="text-base font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
              Instant Payout
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              Client Web3 signature triggers smart contract vault execution, transferring ETH directly to freelancer wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">CURATED LISTINGS</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-white uppercase tracking-tight">
              Verified Web3 Opportunities
            </h2>
          </div>
          <button
            onClick={() => switchView('jobs')}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-white hover:text-amber-400 transition-colors"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => switchView('job-detail', job.id)}
              className="p-8 bg-[#121212] border border-white/10 hover:border-white/40 transition-all cursor-pointer space-y-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-white/5 border border-white/15 text-[#E5E5E5]">
                    {job.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-medium">
                    <span>{job.budgetEth} ETH</span>
                    <span className="text-[10px] text-[#A3A3A3]">(${(job.budgetEth * 2850).toLocaleString()})</span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-normal text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {job.title}
                </h3>

                <p className="text-xs text-[#A3A3A3] line-clamp-3 leading-relaxed font-sans font-light">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {job.skills.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 border border-white/10 bg-[#0D0D0D] text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">
                      {s}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-0.5 border border-white/10 bg-[#0D0D0D] text-[10px] text-[#666] font-mono">
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={job.clientAvatar} alt={job.clientName} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                  <span className="text-[#E5E5E5] font-sans font-medium text-xs">{job.clientName}</span>
                </div>
                <span className="text-[#A3A3A3] font-mono text-[10px] tracking-wider">{job.postedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Selector CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 bg-[#121212] border border-white/20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-[0.3em]">
              TESTNET SANDBOX ACCELERATOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
              Select Your Role & Enter Protocol
            </h2>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              Test end-to-end milestone escrow creation, proposal submission, funds locking, and multi-sig arbitration seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => switchUserRole('client')}
              className="p-6 bg-[#161616] border border-white/10 hover:border-white/40 text-left space-y-3 transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 bg-[#080808] text-white flex items-center justify-center">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
                Client Hub
              </h3>
              <p className="text-[11px] text-[#A3A3A3] font-sans font-light">
                Post jobs, review proposals, fund smart escrows.
              </p>
            </button>

            <button
              onClick={() => switchUserRole('freelancer')}
              className="p-6 bg-[#161616] border border-white/10 hover:border-white/40 text-left space-y-3 transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 bg-[#080808] text-white flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-normal text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">
                Freelancer Hub
              </h3>
              <p className="text-[11px] text-[#A3A3A3] font-sans font-light">
                Submit proposals, attach work proofs, claim ETH.
              </p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
