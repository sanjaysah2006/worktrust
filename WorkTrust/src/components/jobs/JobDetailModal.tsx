import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Coins,
  Clock,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Send,
  FileCode2,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const JobDetailModal: React.FC = () => {
  const {
    selectedJobId,
    jobs,
    switchView,
    currentUser,
    submitProposal,
    proposals,
    setActiveProposalJobId,
    contracts
  } = useApp();

  const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidEth, setBidEth] = useState<number>(job ? job.budgetEth : 2.5);
  const [estimatedDays, setEstimatedDays] = useState<number>(14);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  if (!job) return null;

  const userHasApplied = proposals.some(
    (p) => p.jobId === job.id && p.freelancerId === currentUser.id
  );

  const existingContract = contracts.find((c) => c.jobId === job.id);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter) return;

    submitProposal({
      jobId: job.id,
      jobTitle: job.title,
      coverLetter,
      bidEth,
      estimatedDays,
      portfolioUrl,
    });

    setIsApplying(false);
    setCoverLetter('');
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto font-sans bg-[#080808]">
      {/* Back button */}
      <button
        onClick={() => switchView('jobs')}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace</span>
      </button>

      {/* Title & Budget Hero */}
      <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#181818] text-[#E5E5E5] border border-white/10 text-[10px] font-mono uppercase tracking-wider">
                {job.category}
              </span>
              <span className="px-3 py-1 bg-[#181818] text-[#A3A3A3] border border-white/10 text-[10px] font-mono uppercase tracking-wider">
                {job.experienceLevel} Level
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-800 text-[10px] font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sepolia Escrow Verified
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A3A3A3] font-mono">
              <div className="flex items-center gap-2">
                <img src={job.clientAvatar} alt={job.clientName} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-white font-medium">{job.clientName}</span>
                <span className="text-[#666]">({job.clientAddress})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#666]" />
                <span>{job.duration}</span>
              </div>
              <span>•</span>
              <span>Posted {job.postedDate}</span>
            </div>
          </div>

          <div className="p-6 bg-[#0D0D0D] border border-white/10 text-left md:text-right shrink-0 space-y-1">
            <span className="text-[10px] font-mono text-[#666] block uppercase tracking-widest">Fixed Escrow Budget</span>
            <div className="text-3xl font-serif font-light text-amber-400 font-mono">
              {job.budgetEth} ETH
            </div>
            <div className="text-xs text-[#A3A3A3] font-mono">
              ≈ ${(job.budgetEth * 2850).toLocaleString()} USD
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#A3A3A3] font-mono">
            <UserCheck className="w-4 h-4 text-white" />
            <span>{job.applicantsCount} Proposals Submitted</span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'client' && job.clientAddress.toLowerCase() === currentUser.walletAddress.toLowerCase() ? (
              <button
                onClick={() => {
                  setActiveProposalJobId(job.id);
                }}
                className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
              >
                <span>Review Applicant Bids ({job.applicantsCount})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : existingContract ? (
              <button
                onClick={() => switchView('contract-workspace', existingContract.id)}
                className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
              >
                <Lock className="w-4 h-4" />
                <span>Escrow Workspace</span>
              </button>
            ) : userHasApplied ? (
              <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Proposal Submitted & Under Review</span>
              </div>
            ) : (
              <button
                onClick={() => setIsApplying(true)}
                className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
              >
                <Send className="w-4 h-4" />
                <span>Submit Proposal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Sections: Description + Deliverables + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Description */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-xl font-serif font-normal text-white uppercase tracking-wider">Project Specification</h3>
            <p className="text-sm text-[#E5E5E5] leading-relaxed whitespace-pre-line font-sans font-light">
              {job.description}
            </p>
          </div>

          {/* Required Deliverables Checklist */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-xl font-serif font-normal text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-amber-400" />
              <span>Required Deliverables</span>
            </h3>
            <ul className="space-y-3">
              {job.deliverables.map((del, i) => (
                <li key={i} className="flex items-start gap-3 p-4 bg-[#0D0D0D] border border-white/10 text-xs text-[#E5E5E5]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-sans font-light">{del}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* On-Chain Milestones Breakdown */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-xl font-serif font-normal text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>On-Chain Milestone Schedule</span>
            </h3>

            <div className="space-y-3">
              {job.milestones.map((ms, idx) => (
                <div key={ms.id} className="p-5 bg-[#0D0D0D] border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#181818] border border-white/10 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-serif font-normal text-white">{ms.title}</h4>
                    </div>
                    <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Target Date: {ms.dueDate}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-serif font-light text-amber-400 font-mono">{ms.amountEth} ETH</div>
                    <span className="text-[9px] text-[#666] uppercase tracking-widest font-mono">Milestone Vault</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Client Details & Security */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="p-6 bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666]">Client Verification</h3>
            <div className="flex items-center gap-3">
              <img src={job.clientAvatar} alt={job.clientName} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h4 className="text-base font-serif font-normal text-white">{job.clientName}</h4>
                <p className="text-xs text-amber-400 font-mono font-semibold">★ {job.clientRating} Score</p>
              </div>
            </div>

            <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Address:</span>
                <span className="text-white">{job.clientAddress}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Escrows Completed:</span>
                <span className="text-white">14 Verified</span>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="p-6 bg-[#121212] border border-white/10 space-y-3">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666]">Required Stack</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-[#181818] border border-white/10 text-xs text-[#E5E5E5] font-mono">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Escrow Security Protection Guarantee Card */}
          <div className="p-6 bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-serif text-base">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>WorkTrust Escrow</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
              100% of agreed budget is locked on-chain before work begins. Neither party can unilaterally withdraw funds during contract execution.
            </p>
          </div>
        </div>
      </div>

      {/* Application Drawer / Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border border-white/15 bg-[#121212] p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">PROPOSAL SUBMISSION</span>
                <h3 className="text-xl font-serif font-normal text-white uppercase tracking-wider">Submit Proposal & Bid</h3>
                <p className="text-xs text-[#A3A3A3] font-mono">Opportunity: "{job.title}"</p>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                className="text-[#A3A3A3] hover:text-white p-2 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Cover Letter & Technical Approach</label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain your Web3 expertise, relevant smart contracts built, and proposed timeline..."
                  className="w-full p-3 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Your Bid Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={bidEth}
                    onChange={(e) => setBidEth(parseFloat(e.target.value))}
                    className="w-full p-3 bg-[#0D0D0D] border border-white/10 text-amber-400 font-serif text-base focus:border-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#666] mt-1 block">
                    ≈ ${(bidEth * 2850).toLocaleString()} USD (0% Platform Fee)
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Est. Completion Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(parseInt(e.target.value))}
                    className="w-full p-3 bg-[#0D0D0D] border border-white/10 text-white text-sm focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Portfolio / GitHub / IPFS Link</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/my-work or https://dapp.eth.limo"
                  className="w-full p-3 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] focus:border-white focus:outline-none"
                />
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-6 py-3 bg-[#181818] border border-white/10 text-[#A3A3A3] hover:text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
