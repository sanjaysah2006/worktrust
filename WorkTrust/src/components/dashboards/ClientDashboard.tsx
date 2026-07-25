import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Users,
  Lock,
  PlusCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Coins,
  FileCode2,
  ArrowUpRight
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const {
    jobs,
    contracts,
    proposals,
    currentUser,
    switchView,
    setActiveProposalJobId,
    setIsFundModalOpen,
    setFundingContractId
  } = useApp();

  // Filter client's jobs & contracts
  const myJobs = jobs.filter(
    (j) => j.clientAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
  );

  const myContracts = contracts.filter(
    (c) => c.clientId === currentUser.id || c.clientAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
  );

  const totalProposalsReceived = proposals.filter((p) =>
    myJobs.some((j) => j.id === p.jobId)
  ).length;

  const totalEthLocked = myContracts.reduce((acc, c) => acc + c.escrowBalanceEth, 0);

  // Contracts needing review or funding
  const pendingActions = myContracts.filter(
    (c) => c.status === 'created' || c.status === 'milestone_submitted'
  );

  return (
    <div className="space-y-10 pb-20 font-sans bg-[#080808]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">CLIENT WORKSPACE</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">Client Command Center</h1>
            <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-[#161616] text-[#E5E5E5] border border-white/10">
              Client Active
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] font-sans font-light">
            Manage posted opportunities, inspect freelancer bids, and release escrow funds upon deliverable verification.
          </p>
        </div>

        <button
          onClick={() => switchView('post-job')}
          className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Opportunity</span>
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Briefcase className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Opportunities</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{myJobs.length}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Posted Jobs</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#E5E5E5]">
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Bids</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{totalProposalsReceived}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Proposals Received</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Coins className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Escrow Vaults</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{totalEthLocked.toFixed(2)} ETH</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Smart Contracts Locked</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Lock className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Contracts</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{myContracts.length}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Active Smart Escrows</p>
        </div>
      </div>

      {/* Action Required Alert Box */}
      {pendingActions.length > 0 && (
        <div className="p-6 bg-[#121212] border border-amber-900/40 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Action Required ({pendingActions.length})</span>
          </h3>

          <div className="space-y-2">
            {pendingActions.map((c) => (
              <div key={c.id} className="p-4 bg-[#0D0D0D] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-serif font-normal text-sm text-white">{c.jobTitle}</span>
                  <p className="text-[#A3A3A3] text-[11px] font-mono mt-0.5">
                    {c.status === 'created'
                      ? 'Contract created — awaiting escrow deposit funding'
                      : 'Freelancer submitted deliverables — Review & Release Funds'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {c.status === 'created' ? (
                    <button
                      onClick={() => {
                        setFundingContractId(c.id);
                        setIsFundModalOpen(true);
                      }}
                      className="px-4 py-2 bg-amber-400 text-black font-sans font-semibold text-[10px] uppercase tracking-wider hover:bg-amber-300 transition-all"
                    >
                      Fund {c.agreedAmountEth} ETH
                    </button>
                  ) : (
                    <button
                      onClick={() => switchView('contract-workspace', c.id)}
                      className="px-4 py-2 bg-white text-black font-sans font-semibold text-[10px] uppercase tracking-wider hover:bg-neutral-200 transition-all"
                    >
                      Review Deliverables
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Posted Jobs Table */}
      <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-serif font-normal text-white uppercase tracking-wider">Posted Opportunities ({myJobs.length})</h2>
          <span className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-widest">Sepolia Testnet Sync</span>
        </div>

        {myJobs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/15 space-y-4">
            <p className="text-xs text-[#A3A3A3] font-mono">You have not posted any job opportunities yet.</p>
            <button
              onClick={() => switchView('post-job')}
              className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em]"
            >
              Post First Opportunity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#A3A3A3] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Proposals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {myJobs.map((job) => {
                  const jobProposals = proposals.filter((p) => p.jobId === job.id);
                  const activeContract = myContracts.find((c) => c.jobId === job.id);

                  return (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div
                          onClick={() => switchView('job-detail', job.id)}
                          className="cursor-pointer font-serif font-normal text-sm text-white hover:text-amber-400 transition-colors"
                        >
                          {job.title}
                        </div>
                        <span className="text-[10px] text-[#666] block font-mono">Posted {job.postedDate}</span>
                      </td>

                      <td className="py-4 px-4 font-serif font-light text-amber-400 text-sm">
                        {job.budgetEth} ETH
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-[#181818] text-[#A3A3A3] border border-white/10 text-[10px] uppercase tracking-wider">
                          {job.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 border text-[9px] uppercase tracking-wider font-mono ${
                            job.status === 'open'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                              : job.status === 'in_progress'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-800'
                              : 'bg-[#181818] text-[#A3A3A3] border-white/10'
                          }`}
                        >
                          {job.status === 'open' ? 'Open' : job.status === 'in_progress' ? 'In Contract' : 'Completed'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#E5E5E5] font-mono">
                        {jobProposals.length} Applicants
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeContract ? (
                            <button
                              onClick={() => switchView('contract-workspace', activeContract.id)}
                              className="px-3.5 py-1.5 bg-[#181818] border border-white/20 text-white font-mono text-[10px] uppercase tracking-wider hover:border-white"
                            >
                              Workspace
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveProposalJobId(job.id)}
                              className="px-3.5 py-1.5 bg-white text-black font-sans font-semibold text-[10px] uppercase tracking-wider hover:bg-neutral-200"
                            >
                              Proposals ({jobProposals.length})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
