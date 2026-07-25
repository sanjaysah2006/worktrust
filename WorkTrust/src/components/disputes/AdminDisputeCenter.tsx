import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gavel,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Users,
  Coins,
  Scale,
  FileCode2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DisputeCase } from '../../types';

export const AdminDisputeCenter: React.FC = () => {
  const { disputes, resolveDisputeAdmin, contracts } = useApp();

  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [verdictNotes, setVerdictNotes] = useState('');

  const activeDisputes = disputes.filter((d) => d.status === 'pending_admin');
  const resolvedDisputes = disputes.filter((d) => d.status !== 'pending_admin');

  const selectedDispute = disputes.find((d) => d.id === selectedDisputeId) || disputes[0];

  const handleExecuteVerdict = (verdict: 'freelancer' | 'client' | 'split') => {
    if (!selectedDispute) return;
    resolveDisputeAdmin(selectedDispute.id, verdict, verdictNotes || 'Multi-Sig arbitration verdict executed.');
    setSelectedDisputeId(null);
    setVerdictNotes('');
  };

  return (
    <div className="space-y-10 pb-20 font-sans bg-[#080808]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">MULTI-SIG COUNCIL TRIBUNAL</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">Arbitration Court</h1>
            <span className="px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-purple-950/40 text-purple-300 border border-purple-800">
              Council Active
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] font-sans font-light">
            Review claims, inspect code proofs and IPFS evidence, and execute binding multi-sig payouts.
          </p>
        </div>

        <div className="p-3 bg-[#121212] border border-white/10 flex items-center gap-2 text-xs font-mono text-[#A3A3A3]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Threshold: 3 of 5 Council Signatures</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <Gavel className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Pending Cases</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{activeDisputes.length}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Awaiting Arbitration</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Coins className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Frozen ETH</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">
            {disputes.reduce((acc, d) => acc + d.amountEth, 0).toFixed(2)} ETH
          </div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Under Audit</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Resolved</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">{resolvedDisputes.length + 142}</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Historical Verdicts</p>
        </div>

        <div className="p-6 bg-[#121212] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <Scale className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#666]">Consensus</span>
          </div>
          <div className="text-3xl font-serif font-light text-white font-mono">99.8%</div>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">Council Alignment</p>
        </div>
      </div>

      {/* Main Grid: Active Cases + Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cases List (1 Col) */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">
            DISPUTES DOCKET ({disputes.length})
          </h2>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDisputeId(d.id)}
                className={`p-5 border transition-all cursor-pointer space-y-3 ${
                  selectedDispute?.id === d.id
                    ? 'bg-[#161616] border-white/40 text-white'
                    : 'bg-[#121212] border-white/10 text-[#A3A3A3] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">Case #{d.id}</span>
                  <span className="text-sm font-serif font-light text-amber-400 font-mono">{d.amountEth} ETH</span>
                </div>

                <h3 className="text-sm font-serif font-normal text-white line-clamp-1">{d.jobTitle}</h3>
                <p className="text-xs text-[#A3A3A3] line-clamp-2 font-sans font-light">{d.reason}</p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono uppercase tracking-wider">
                  <span
                    className={`px-2.5 py-0.5 border ${
                      d.status === 'pending_admin'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-800'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                  <span className="text-white flex items-center gap-1">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Inspector & Verdict Execution (2 Cols) */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block mb-1">Docket #{selectedDispute.id}</span>
                  <h2 className="text-2xl font-serif font-normal text-white">{selectedDispute.jobTitle}</h2>
                </div>

                <div className="p-4 bg-[#0D0D0D] border border-white/10 text-right shrink-0 font-mono">
                  <span className="text-[9px] text-[#A3A3A3] uppercase tracking-wider block">Frozen Escrow</span>
                  <span className="text-xl font-serif font-light text-amber-400">{selectedDispute.amountEth} ETH</span>
                </div>
              </div>

              {/* Side-by-Side Claims Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block">Client Party</span>
                  <div className="text-sm font-serif font-normal text-white">{selectedDispute.clientName}</div>
                  <div className="text-[10px] text-[#666] font-mono">{selectedDispute.clientAddress}</div>
                </div>

                <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">Freelancer Party</span>
                  <div className="text-sm font-serif font-normal text-white">{selectedDispute.freelancerName}</div>
                  <div className="text-[10px] text-[#666] font-mono">{selectedDispute.freelancerAddress}</div>
                </div>
              </div>

              {/* Claim Statement */}
              <div className="p-5 bg-[#0D0D0D] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block">Filed Claim Statement</span>
                <div className="text-xs font-mono text-white">{selectedDispute.reason}</div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed font-sans font-light">{selectedDispute.explanation}</p>
              </div>

              {/* Evidence Inspector */}
              {selectedDispute.evidenceUrls.length > 0 && (
                <div className="p-5 bg-[#0D0D0D] border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Evidence Artifacts</span>
                  <div className="space-y-1">
                    {selectedDispute.evidenceUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white hover:text-amber-400 font-mono flex items-center gap-1.5"
                      >
                        <span>Proof Item #{i + 1}: {url}</span>
                        <ExternalLink className="w-3 h-3 text-[#666]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Verdict Execution Controls */}
              {selectedDispute.status === 'pending_admin' ? (
                <div className="p-6 bg-[#0D0D0D] border border-white/15 space-y-5">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-400" />
                    <span>Issue Binding Verdict</span>
                  </h3>

                  <div>
                    <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Findings & Rationale</label>
                    <textarea
                      rows={3}
                      value={verdictNotes}
                      onChange={(e) => setVerdictNotes(e.target.value)}
                      placeholder="Explain arbitration decision based on code analysis, deliverables, and specification compliance..."
                      className="w-full p-3.5 bg-[#141414] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleExecuteVerdict('freelancer')}
                      className="p-3.5 bg-white text-black font-sans font-semibold text-[10px] uppercase tracking-[0.15em] hover:bg-neutral-200 transition-all"
                    >
                      100% to Freelancer
                    </button>

                    <button
                      onClick={() => handleExecuteVerdict('client')}
                      className="p-3.5 bg-rose-500 hover:bg-rose-400 text-black font-sans font-semibold text-[10px] uppercase tracking-[0.15em] transition-all"
                    >
                      100% Refund to Client
                    </button>

                    <button
                      onClick={() => handleExecuteVerdict('split')}
                      className="p-3.5 bg-[#181818] border border-white/20 hover:border-white text-white font-sans font-semibold text-[10px] uppercase tracking-[0.15em] transition-all"
                    >
                      Split 50% / 50%
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#0D0D0D] border border-emerald-800 text-emerald-300 text-xs font-mono space-y-1">
                  <span className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Case Resolved
                  </span>
                  <p className="text-[10px] uppercase tracking-wider">Status: {selectedDispute.status.toUpperCase()}</p>
                  {selectedDispute.adminNotes && <p className="text-[10px] text-[#A3A3A3]">Rationale: {selectedDispute.adminNotes}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#121212] border border-white/10 text-[#A3A3A3] font-mono text-xs uppercase tracking-widest">
              Select a dispute docket on the left to inspect evidence and execute verdict.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
