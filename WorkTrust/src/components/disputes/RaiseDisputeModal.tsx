import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Gavel,
  AlertTriangle,
  Send,
  ShieldAlert
} from 'lucide-react';

export const RaiseDisputeModal: React.FC = () => {
  const {
    isRaiseDisputeModalOpen,
    setIsRaiseDisputeModalOpen,
    selectedContractId,
    contracts,
    raiseDispute
  } = useApp();

  const [reason, setReason] = useState('Incomplete Deliverable & Missed Scope');
  const [explanation, setExplanation] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const contract = contracts.find((c) => c.id === selectedContractId);
  if (!isRaiseDisputeModalOpen || !contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation) return;

    raiseDispute(contract.id, reason, explanation, evidenceUrl ? [evidenceUrl] : []);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
      <div className="relative w-full max-w-xl bg-[#121212] border border-rose-900/40 shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0D0D0D] text-rose-400 border border-white/10">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-normal text-white uppercase tracking-wider">Escalate to Arbitration</h3>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Freeze Escrow & Request Multi-Sig Review</p>
            </div>
          </div>
          <button
            onClick={() => setIsRaiseDisputeModalOpen(false)}
            className="text-[#A3A3A3] hover:text-white p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="p-4 bg-[#0D0D0D] border border-rose-900/50 flex items-start gap-3 text-xs text-rose-200 font-sans">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-rose-400 block">Escrow Vault Freeze</span>
            <p className="text-[11px] text-[#A3A3A3] leading-relaxed font-light">
              Submitting a dispute immediately locks all {contract.escrowBalanceEth} ETH in vault {contract.contractAddress.substring(0, 8)}... Funds cannot be withdrawn until elected WorkTrust Arbitrators issue an on-chain verdict.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Dispute Reason Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3.5 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono focus:border-white focus:outline-none"
            >
              <option value="Incomplete Deliverable & Missed Scope">Incomplete Deliverable & Missed Scope</option>
              <option value="Unresponsive Counterparty">Unresponsive Counterparty</option>
              <option value="Code Quality & Vulnerabilities Found">Code Quality & Vulnerabilities Found</option>
              <option value="Unreasonable Scope Creep">Unreasonable Scope Creep</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Detailed Explanation & Timeline *</label>
            <textarea
              rows={4}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="State your case clearly with timeline events, missed specifications, or code issues..."
              className="w-full p-4 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Evidence / Screenshots / IPFS URL</label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://ipfs.io/ipfs/Qm... or https://github.com/..."
              className="w-full p-3 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRaiseDisputeModalOpen(false)}
              className="px-5 py-2.5 bg-[#181818] border border-white/10 text-[#A3A3A3] text-xs font-mono uppercase tracking-wider hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow"
            >
              <Gavel className="w-4 h-4" />
              <span>Submit Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
