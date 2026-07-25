import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Coins,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCode2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Download,
  Copy,
  ChevronRight,
  Gavel
} from 'lucide-react';

export const ContractWorkspace: React.FC = () => {
  const {
    selectedContractId,
    contracts,
    currentUser,
    switchView,
    approveAndReleaseFunds,
    setIsSubmitWorkModalOpen,
    setIsRaiseDisputeModalOpen,
    setIsFundModalOpen,
    setFundingContractId,
    addToast
  } = useApp();

  const [copied, setCopied] = useState(false);
  const contract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  if (!contract) {
    return (
      <div className="p-16 text-center text-[#A3A3A3] space-y-4 bg-[#080808]">
        <p className="font-mono text-xs uppercase tracking-widest">No contract selected.</p>
        <button onClick={() => switchView('jobs')} className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em]">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isClient = currentUser.role === 'client' || currentUser.walletAddress.toLowerCase() === contract.clientAddress.toLowerCase();
  const isFreelancer = currentUser.role === 'freelancer' || currentUser.walletAddress.toLowerCase() === contract.freelancerAddress.toLowerCase();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contract.contractAddress);
    setCopied(true);
    addToast('Address Copied', 'Contract address copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSubmission = contract.submissions[0];

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto font-sans bg-[#080808]">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => switchView(isClient ? 'client-dashboard' : 'freelancer-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setIsRaiseDisputeModalOpen(true)}
          className="px-4 py-2 bg-[#121212] border border-rose-500/40 hover:border-rose-400 text-rose-300 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
        >
          <Gavel className="w-3.5 h-3.5 text-rose-400" />
          <span>Raise Dispute</span>
        </button>
      </div>

      {/* Contract Header Card */}
      <div className="p-10 bg-[#121212] border border-white/10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-white/5 border border-white/15 text-[#E5E5E5]">
                Vault #{contract.id}
              </span>
              <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-[#181818] border border-white/10 text-[#A3A3A3]">
                Sepolia Escrow
              </span>
              <span
                className={`px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] border ${
                  contract.status === 'funded' || contract.status === 'in_progress'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                    : contract.status === 'milestone_submitted'
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800'
                    : contract.status === 'disputed'
                    ? 'bg-rose-950/40 text-rose-400 border-rose-800'
                    : 'bg-[#181818] text-[#A3A3A3] border-white/10'
                }`}
              >
                ● {contract.status.toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
              {contract.jobTitle}
            </h1>

            <div className="flex items-center gap-2 font-mono text-xs text-[#A3A3A3] bg-[#0D0D0D] p-3 border border-white/10 w-fit">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Contract Address: {contract.contractAddress}</span>
              <button onClick={handleCopyAddress} className="text-[#A3A3A3] hover:text-white p-0.5 ml-1">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-[#0D0D0D] border border-white/10 text-left lg:text-right shrink-0 space-y-1">
            <span className="text-[10px] font-mono text-[#A3A3A3] block uppercase tracking-[0.2em]">Escrow Balance</span>
            <div className="text-3xl font-serif font-light text-amber-400 font-mono">
              {contract.escrowBalanceEth.toFixed(2)} ETH
            </div>
            <div className="text-[10px] text-[#666] font-mono uppercase tracking-wider">
              Budget: {contract.agreedAmountEth} ETH
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div
            className={`p-4 border text-xs font-mono space-y-1 ${
              contract.status !== 'created'
                ? 'bg-[#161616] border-white/30 text-white'
                : 'bg-[#0D0D0D] border-white/10 text-[#666]'
            }`}
          >
            <div className="flex items-center justify-between font-medium uppercase tracking-wider text-[10px]">
              <span>1. Created</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[9px] text-[#A3A3A3] tracking-wider">Initialized</p>
          </div>

          <div
            className={`p-4 border text-xs font-mono space-y-1 ${
              contract.escrowBalanceEth > 0
                ? 'bg-[#161616] border-white/30 text-white'
                : 'bg-[#0D0D0D] border-white/10 text-[#666]'
            }`}
          >
            <div className="flex items-center justify-between font-medium uppercase tracking-wider text-[10px]">
              <span>2. Vault Funded</span>
              {contract.escrowBalanceEth > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[9px] text-[#A3A3A3] tracking-wider">{contract.escrowBalanceEth} ETH Locked</p>
          </div>

          <div
            className={`p-4 border text-xs font-mono space-y-1 ${
              contract.submissions.length > 0
                ? 'bg-[#161616] border-white/30 text-white'
                : 'bg-[#0D0D0D] border-white/10 text-[#666]'
            }`}
          >
            <div className="flex items-center justify-between font-medium uppercase tracking-wider text-[10px]">
              <span>3. Work Proof</span>
              {contract.submissions.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[9px] text-[#A3A3A3] tracking-wider">{contract.submissions.length} Submissions</p>
          </div>

          <div
            className={`p-4 border text-xs font-mono space-y-1 ${
              contract.status === 'funds_released'
                ? 'bg-[#161616] border-white/30 text-white'
                : 'bg-[#0D0D0D] border-white/10 text-[#666]'
            }`}
          >
            <div className="flex items-center justify-between font-medium uppercase tracking-wider text-[10px]">
              <span>4. Settled</span>
              {contract.status === 'funds_released' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[9px] text-[#A3A3A3] tracking-wider">Payout Complete</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Milestone Schedule & Action Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestone Schedule */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
            <h3 className="text-base font-serif font-normal text-white uppercase tracking-wider flex items-center justify-between">
              <span>Milestone Schedule</span>
              <span className="text-[10px] text-[#A3A3A3] font-mono">
                {contract.milestones.length} PHASES
              </span>
            </h3>

            <div className="space-y-4">
              {contract.milestones.map((ms, idx) => (
                <div
                  key={ms.id}
                  className="p-6 bg-[#0D0D0D] border border-white/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Phase #{idx + 1}</span>
                      <h4 className="text-base font-serif font-normal text-white">{ms.title}</h4>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-base font-serif font-light text-amber-400 font-mono">{ms.amountEth} ETH</span>
                      <span className="text-[10px] text-[#666] block font-mono uppercase tracking-wider">Target: {ms.dueDate}</span>
                    </div>
                  </div>

                  {ms.submissionNotes && (
                    <div className="p-4 bg-[#141414] border border-white/10 text-xs text-[#A3A3A3] space-y-1 font-sans">
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block">Submitted Notes:</span>
                      <p>{ms.submissionNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <span
                      className={`px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] ${
                        ms.status === 'released'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
                          : ms.status === 'submitted'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-800'
                          : 'bg-[#181818] text-[#A3A3A3] border border-white/10'
                      }`}
                    >
                      Status: {ms.status.toUpperCase()}
                    </span>

                    {/* Actions depending on Role & Status */}
                    {isClient && ms.status === 'submitted' && (
                      <button
                        onClick={() => approveAndReleaseFunds(contract.id, ms.id)}
                        className="px-6 py-2.5 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve & Release {ms.amountEth} ETH</span>
                      </button>
                    )}

                    {isFreelancer && (ms.status === 'funded' || ms.status === 'pending') && (
                      <button
                        onClick={() => setIsSubmitWorkModalOpen(true)}
                        className="px-6 py-2.5 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Work Proof</span>
                      </button>
                    )}

                    {isClient && contract.escrowBalanceEth === 0 && contract.status === 'created' && (
                      <button
                        onClick={() => {
                          setFundingContractId(contract.id);
                          setIsFundModalOpen(true);
                        }}
                        className="px-6 py-2.5 bg-amber-400 text-black font-sans font-semibold text-xs uppercase tracking-[0.2em]"
                      >
                        Fund Vault ({contract.agreedAmountEth} ETH)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Deliverables Proofs Inspector */}
          {currentSubmission && (
            <div className="p-8 bg-[#121212] border border-white/10 space-y-4">
              <h3 className="text-base font-serif font-normal text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span>On-Chain Deliverables Inspector</span>
              </h3>

              <div className="p-5 bg-[#0D0D0D] border border-white/10 space-y-4">
                <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">
                  {currentSubmission.summary}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  {currentSubmission.repoUrl && (
                    <a
                      href={currentSubmission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#161616] border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.15em] flex items-center gap-2 hover:border-white transition-all"
                    >
                      <span>GitHub Repo</span>
                      <ExternalLink className="w-3 h-3 text-[#A3A3A3]" />
                    </a>
                  )}

                  {currentSubmission.deploymentUrl && (
                    <a
                      href={currentSubmission.deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#161616] border border-white/20 text-emerald-400 text-[10px] font-mono uppercase tracking-[0.15em] flex items-center gap-2 hover:border-emerald-400 transition-all"
                    >
                      <span>Live App</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  )}
                </div>

                {currentSubmission.files.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] font-mono text-[#666] uppercase tracking-wider block">Attached Artifacts:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentSubmission.files.map((f, i) => (
                        <div key={i} className="p-3 bg-[#141414] border border-white/10 flex items-center justify-between text-xs font-mono">
                          <span className="text-[#E5E5E5] truncate">{f.name}</span>
                          <span className="text-[#666] text-[10px]">{f.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Contract Participants & Security */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="p-6 bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">Counterparties</h3>

            {/* Client */}
            <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-1">
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block">Client</span>
              <div className="text-sm font-serif font-normal text-white">{contract.clientName}</div>
              <div className="text-[10px] text-[#666] font-mono">{contract.clientAddress.substring(0, 10)}...</div>
            </div>

            {/* Freelancer */}
            <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">Freelancer</span>
              <div className="text-sm font-serif font-normal text-white">{contract.freelancerName}</div>
              <div className="text-[10px] text-[#666] font-mono">{contract.freelancerAddress.substring(0, 10)}...</div>
            </div>
          </div>

          {/* On-Chain Hashes */}
          <div className="p-6 bg-[#121212] border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">Blockchain Evidence</h3>

            <div className="space-y-3">
              <div>
                <span className="text-[#666] text-[9px] block uppercase tracking-wider">Creation Tx:</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${contract.createdTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-amber-400 text-[10px] truncate block"
                >
                  {contract.createdTxHash.substring(0, 18)}...
                </a>
              </div>

              {contract.fundedTxHash && (
                <div>
                  <span className="text-[#666] text-[9px] block uppercase tracking-wider">Funding Tx:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${contract.fundedTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline text-[10px] truncate block"
                  >
                    {contract.fundedTxHash.substring(0, 18)}...
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
