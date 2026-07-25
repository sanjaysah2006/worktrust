import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Send,
  CheckCircle2,
  FileCode2,
  UploadCloud,
  Paperclip
} from 'lucide-react';

export const SubmitWorkModal: React.FC = () => {
  const {
    isSubmitWorkModalOpen,
    setIsSubmitWorkModalOpen,
    selectedContractId,
    contracts,
    submitWork,
    jobs
  } = useApp();

  const [summary, setSummary] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');

  // Deliverables checklist tracking
  const contract = contracts.find((c) => c.id === selectedContractId);
  const job = jobs.find((j) => j.id === contract?.jobId);

  const [checkedDeliverables, setCheckedDeliverables] = useState<number[]>([]);

  if (!isSubmitWorkModalOpen || !contract) return null;

  const toggleCheck = (idx: number) => {
    setCheckedDeliverables((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const deliverablesList = job?.deliverables || [
    'Completed Codebase & Contract Test Suite',
    'Documentation & Deployment Proof'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary) return;

    const mockFiles = [
      { name: 'Audit_Proof_Report.pdf', size: '1.8 MB', type: 'application/pdf' },
      { name: 'TestCoverage.t.sol', size: '24 KB', type: 'text/plain' }
    ];

    const targetMs = contract.milestones[0];
    submitWork(contract.id, targetMs?.id || 'ms_1', summary, repoUrl, deploymentUrl, mockFiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0D0D0D] text-amber-400 border border-white/10">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-normal text-white uppercase tracking-wider">Submit Deliverable Proof</h3>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Contract: {contract.jobTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSubmitWorkModalOpen(false)}
            className="text-[#A3A3A3] hover:text-white p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Deliverables Checklist */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block">
              Deliverables Checklist (Verify completed items)
            </label>
            <div className="space-y-2">
              {deliverablesList.map((del, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3.5 bg-[#0D0D0D] border border-white/10 text-xs text-[#E5E5E5] cursor-pointer hover:border-white/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checkedDeliverables.includes(idx)}
                    onChange={() => toggleCheck(idx)}
                    className="accent-white bg-[#080808] border-white/20"
                  />
                  <span>{del}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Work Summary & Proof Notes *</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe completed tasks, contract fixes, test suite results..."
              className="w-full p-4 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">GitHub Repository Link</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/my-org/repo"
                className="w-full p-3 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Deployment / IPFS URL</label>
              <input
                type="url"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                placeholder="https://ipfs.io/ipfs/Qm..."
                className="w-full p-3 bg-[#0D0D0D] border border-white/15 text-white text-xs font-mono placeholder-[#666] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="p-6 border border-dashed border-white/20 bg-[#0D0D0D] text-center space-y-2">
            <UploadCloud className="w-6 h-6 text-[#A3A3A3] mx-auto" />
            <div className="text-xs font-mono uppercase tracking-wider text-white">Attached File Proofs</div>
            <p className="text-[10px] text-[#666] font-mono">PDF audit reports, Foundry test logs, or contract ABIs attached.</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitWorkModalOpen(false)}
              className="px-5 py-2.5 bg-[#181818] border border-white/10 text-[#A3A3A3] text-xs font-mono uppercase tracking-wider hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Deliverable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
