import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Coins,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  FileCode2
} from 'lucide-react';
import { ExperienceLevel, Milestone } from '../../types';

export const PostJobPage: React.FC = () => {
  const { addJob, switchView, currentUser, wallet } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Audit & Security');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Intermediate');
  const [duration, setDuration] = useState('2 Weeks');
  const [description, setDescription] = useState('');

  // Deliverables List
  const [deliverables, setDeliverables] = useState<string[]>([
    'Comprehensive PDF Audit Report',
    'Hardhat/Foundry PoC test suite'
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');

  // Skills List
  const [skills, setSkills] = useState<string[]>(['Solidity', 'Foundry', 'Hardhat']);
  const [newSkill, setNewSkill] = useState('');

  // Budget & Milestones
  const [budgetEth, setBudgetEth] = useState<number>(2.5);
  const [milestones, setMilestones] = useState<{ title: string; amountEth: number; dueDate: string }[]>([
    { title: 'Initial Architecture Review & Code Scan', amountEth: 1.0, dueDate: '2026-05-20' },
    { title: 'Final Verification & Exploit PoC', amountEth: 1.5, dueDate: '2026-05-30' }
  ]);

  const addDeliverableItem = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverableItem = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const addSkillTag = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkillTag = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addMilestoneRow = () => {
    setMilestones([...milestones, { title: 'New Milestone Phase', amountEth: 1.0, dueDate: '2026-06-15' }]);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || deliverables.length === 0) return;

    const formattedMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: 'ms_' + Date.now() + '_' + idx,
      title: m.title,
      amountEth: m.amountEth,
      dueDate: m.dueDate,
      status: 'pending',
    }));

    addJob({
      title,
      category,
      experienceLevel,
      duration,
      description,
      deliverables,
      skills,
      budgetEth,
      milestones: formattedMilestones,
      escrowProtected: true,
    });
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto font-sans bg-[#080808]">
      {/* Back button */}
      <button
        onClick={() => switchView('jobs')}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace</span>
      </button>

      <div className="border-b border-white/10 pb-6 space-y-1">
        <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">CONTRACT DEPLOYMENT</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight flex items-center gap-3">
          <span>Deploy Opportunity & Smart Escrow</span>
          <Sparkles className="w-6 h-6 text-amber-400" />
        </h1>
        <p className="text-xs text-[#A3A3A3] font-sans font-light">
          Specify contract parameters. Smart contract vault will be initialized on Sepolia testnet upon posting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 font-mono text-xs">
          {/* Section 1: Basic Info */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3] border-b border-white/10 pb-3">
              1. Project Specification
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Solidity Smart Contract Audit for Yield Aggregator"
                  className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
                  >
                    <option value="Audit & Security">Audit & Security</option>
                    <option value="Full Stack Web3">Full Stack Web3</option>
                    <option value="Smart Contracts">Smart Contracts</option>
                    <option value="ZK & Cryptography">ZK & Cryptography</option>
                    <option value="Frontend & DApp">Frontend & DApp</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert Level</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 Weeks"
                    className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe contract architecture, vault logic, requirements, testing criteria..."
                  className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] text-xs focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Deliverables Builder */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3] border-b border-white/10 pb-3">
              2. Required Deliverables Checklist
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Add deliverable requirement (e.g. PDF audit report, Foundry PoC)..."
                className="flex-1 p-3.5 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] text-xs focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addDeliverableItem}
                className="px-5 py-3.5 bg-[#181818] border border-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 hover:border-white"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <ul className="space-y-2">
              {deliverables.map((del, i) => (
                <li key={i} className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-white/10 text-xs text-[#E5E5E5]">
                  <span className="flex items-center gap-2 font-sans font-light">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {del}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDeliverableItem(i)}
                    className="text-[#666] hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Tech Stack Tags */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3] border-b border-white/10 pb-3">
              3. Required Tech Stack Tags
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill tag (Solidity, Wagmi, Rust)..."
                className="flex-1 p-3.5 bg-[#0D0D0D] border border-white/10 text-white placeholder-[#666] text-xs focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkillTag}
                className="px-5 py-3.5 bg-[#181818] border border-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 hover:border-white"
              >
                <Plus className="w-4 h-4" /> Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3.5 py-1.5 bg-[#181818] border border-white/10 text-xs text-[#E5E5E5] font-mono flex items-center gap-2 uppercase tracking-wider"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillTag(skill)}
                    className="text-[#666] hover:text-rose-400 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Budget & Milestones Schedule */}
          <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3]">
                4. Budget & Milestone Schedule
              </h3>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Total Budget:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={budgetEth}
                  onChange={(e) => setBudgetEth(parseFloat(e.target.value) || 0)}
                  className="w-28 p-2 bg-[#0D0D0D] border border-white/10 text-amber-400 font-serif font-light text-base text-right"
                />
              </div>
            </div>

            <div className="space-y-3">
              {milestones.map((ms, i) => (
                <div key={i} className="p-5 bg-[#0D0D0D] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A3A3A3] uppercase tracking-widest font-mono">Milestone Phase #{i + 1}</span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="text-[#666] hover:text-rose-400 text-xs uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={ms.title}
                      onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                      placeholder="Milestone description"
                      className="p-3 bg-[#181818] border border-white/10 text-white text-xs"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={ms.amountEth}
                      onChange={(e) => updateMilestone(i, 'amountEth', parseFloat(e.target.value))}
                      placeholder="Amount ETH"
                      className="p-3 bg-[#181818] border border-white/10 text-amber-400 font-serif text-sm"
                    />
                    <input
                      type="date"
                      value={ms.dueDate}
                      onChange={(e) => updateMilestone(i, 'dueDate', e.target.value)}
                      className="p-3 bg-[#181818] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMilestoneRow}
              className="w-full py-3 bg-[#0D0D0D] border border-dashed border-white/20 text-[#A3A3A3] hover:text-white hover:border-white text-xs font-mono uppercase tracking-[0.2em] transition-colors"
            >
              + Add Milestone Phase
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Deploy Smart Contract Escrow & Post Job</span>
          </button>
        </form>

        {/* Dynamic Real-time Live Preview Card (1 col) */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666]">
            Smart Contract Preview
          </h3>

          <div className="p-6 bg-[#121212] border border-white/10 space-y-4 sticky top-24 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[9px] text-[#666] uppercase tracking-widest">Factory State</span>
              <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-[#181818] text-[#E5E5E5] border border-white/10">
                Ready to Deploy
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-serif font-normal text-white uppercase tracking-tight leading-tight">
                {title || 'Job Title Preview'}
              </h4>
              <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Category: {category}</p>
            </div>

            <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-2">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Escrow Budget:</span>
                <span className="text-amber-400 font-serif font-light text-base">{budgetEth} ETH</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>USD Value:</span>
                <span className="text-white">${(budgetEth * 2850).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Client Wallet:</span>
                <span className="text-white">{currentUser.walletAddress.substring(0, 6)}...</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#666] uppercase tracking-widest block">Deliverables ({deliverables.length})</span>
              <ul className="space-y-1">
                {deliverables.map((d, i) => (
                  <li key={i} className="text-[11px] text-[#A3A3A3] flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Escrow Security Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
