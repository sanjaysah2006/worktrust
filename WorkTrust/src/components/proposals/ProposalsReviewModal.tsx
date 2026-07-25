import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Coins,
  Clock,
  Send,
  ShieldCheck,
  Award
} from 'lucide-react';

export const ProposalsReviewModal: React.FC = () => {
  const {
    activeProposalJobId,
    setActiveProposalJobId,
    jobs,
    proposals,
    hireFreelancer,
    switchView
  } = useApp();

  if (!activeProposalJobId) return null;

  const job = jobs.find((j) => j.id === activeProposalJobId);
  const jobProposals = proposals.filter((p) => p.jobId === activeProposalJobId);

  if (!job) return null;

  const handleHire = (proposalId: string) => {
    hireFreelancer(job.id, proposalId);
    setActiveProposalJobId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white font-display">Review Proposals & Applicants</h3>
            <p className="text-xs text-slate-400 font-mono">Job: "{job.title}"</p>
          </div>
          <button
            onClick={() => setActiveProposalJobId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Proposals List Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {jobProposals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No proposals received yet for this opportunity.</p>
            </div>
          ) : (
            jobProposals.map((prop) => (
              <div
                key={prop.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={prop.freelancerAvatar} alt={prop.freelancerName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{prop.freelancerName}</span>
                        <span className="text-xs text-amber-400 font-mono font-semibold">★ {prop.freelancerRating}</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{prop.freelancerAddress}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Bid Amount</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{prop.bidEth} ETH</span>
                    <span className="text-[10px] text-slate-400 font-mono block">≈ {prop.estimatedDays} Days</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  "{prop.coverLetter}"
                </p>

                {prop.portfolioUrl && (
                  <a
                    href={prop.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
                  >
                    <span>Portfolio / Repository: {prop.portfolioUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Submitted {prop.submittedAt}</span>

                  <button
                    onClick={() => handleHire(prop.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hire & Initialize Escrow Vault</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
