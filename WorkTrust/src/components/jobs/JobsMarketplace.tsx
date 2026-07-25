import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  ShieldCheck,
  Coins,
  Clock,
  UserCheck,
  ChevronRight,
  Filter,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { JobOpportunity, ExperienceLevel, JobStatus } from '../../types';

export const JobsMarketplace: React.FC = () => {
  const { jobs, switchView, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(10);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>(['open']);
  const [escrowOnly, setEscrowOnly] = useState<boolean>(true);

  const categories = ['All', 'Audit & Security', 'Full Stack Web3', 'Smart Contracts', 'ZK & Cryptography', 'Frontend & DApp'];

  const toggleExperience = (exp: ExperienceLevel) => {
    setSelectedExperience((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  const toggleStatus = (st: JobStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

      // Budget
      const matchesBudget = job.budgetEth <= maxBudget;

      // Experience Level
      const matchesExp =
        selectedExperience.length === 0 || selectedExperience.includes(job.experienceLevel);

      // Status
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(job.status);

      // Escrow
      const matchesEscrow = !escrowOnly || job.escrowProtected;

      return matchesSearch && matchesCategory && matchesBudget && matchesExp && matchesStatus && matchesEscrow;
    });
  }, [jobs, searchQuery, selectedCategory, maxBudget, selectedExperience, selectedStatuses, escrowOnly]);

  return (
    <div className="space-y-10 pb-20 font-sans bg-[#080808]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">DECENTRALIZED BOURSE</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
            Browse Verified Opportunities
          </h1>
          <p className="text-xs text-[#A3A3A3] font-sans font-light">
            Discover active contracts backed by non-custodial smart contract escrow vaults on Sepolia.
          </p>
        </div>

        {currentUser.role === 'client' && (
          <button
            onClick={() => switchView('post-job')}
            className="self-start md:self-auto px-6 py-3 bg-white text-black hover:bg-neutral-200 font-sans font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow"
          >
            <Briefcase className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        )}
      </div>

      {/* Search Bar & Category Quick Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY TITLE, TECH STACK (SOLIDITY, ZK, REACT)..."
            className="w-full pl-12 pr-10 py-4 bg-[#121212] border border-white/15 text-white placeholder-[#666] text-xs font-mono tracking-wider focus:outline-none focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-[#121212] border-white/10 text-[#A3A3A3] hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Jobs List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-[#121212] p-6 border border-white/10 h-fit">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMaxBudget(10);
                setSelectedExperience([]);
                setSelectedStatuses(['open']);
                setEscrowOnly(true);
              }}
              className="text-[10px] font-mono uppercase tracking-wider text-[#A3A3A3] hover:text-white"
            >
              Reset
            </button>
          </div>

          {/* Budget Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[#A3A3A3] font-mono text-[10px] uppercase tracking-wider">Max Budget</label>
              <span className="text-amber-400 font-bold font-mono text-xs">{maxBudget} ETH</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseFloat(e.target.value))}
              className="w-full accent-white bg-[#1A1A1A] rounded-none h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#666]">
              <span>0.5 ETH</span>
              <span>5.0 ETH</span>
              <span>10.0 ETH</span>
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-[10px] font-mono text-white uppercase tracking-wider block">Experience Level</label>
            {(['Entry', 'Intermediate', 'Expert'] as ExperienceLevel[]).map((exp) => (
              <label key={exp} className="flex items-center gap-2.5 text-xs text-[#A3A3A3] cursor-pointer hover:text-white font-sans">
                <input
                  type="checkbox"
                  checked={selectedExperience.includes(exp)}
                  onChange={() => toggleExperience(exp)}
                  className="accent-white bg-[#080808] border-white/20"
                />
                <span className="text-xs">{exp}</span>
              </label>
            ))}
          </div>

          {/* Contract Status */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-[10px] font-mono text-white uppercase tracking-wider block">Contract Status</label>
            {[
              { id: 'open' as JobStatus, label: 'Open for Bids' },
              { id: 'in_progress' as JobStatus, label: 'Active Contract' },
              { id: 'completed' as JobStatus, label: 'Completed' }
            ].map((st) => (
              <label key={st.id} className="flex items-center gap-2.5 text-xs text-[#A3A3A3] cursor-pointer hover:text-white font-sans">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(st.id)}
                  onChange={() => toggleStatus(st.id)}
                  className="accent-white bg-[#080808] border-white/20"
                />
                <span className="text-xs">{st.label}</span>
              </label>
            ))}
          </div>

          {/* Smart Contract Escrow Guarantee Toggle */}
          <div className="pt-4 border-t border-white/10">
            <label className="flex items-center justify-between text-xs text-[#A3A3A3] cursor-pointer">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Escrow</span>
              </span>
              <input
                type="checkbox"
                checked={escrowOnly}
                onChange={(e) => setEscrowOnly(e.target.checked)}
                className="accent-emerald-400 bg-[#080808] border-white/20"
              />
            </label>
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-[10px] text-[#A3A3A3] font-mono uppercase tracking-widest">
            <span>SHOWING {filteredJobs.length} RESULTS</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SMART CONTRACT ESCROW BACKED
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-16 text-center bg-[#121212] border border-white/10 space-y-4">
              <Briefcase className="w-10 h-10 text-[#404040] mx-auto" />
              <h3 className="text-base font-serif font-normal text-white uppercase tracking-wider">No matching opportunities found</h3>
              <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto font-sans font-light">
                Try loosening your budget filters or searching for alternative tech terms like Solidity or React.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => switchView('job-detail', job.id)}
                  className="p-8 bg-[#121212] border border-white/10 hover:border-white/40 transition-all cursor-pointer space-y-5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] bg-white/5 border border-white/15 text-[#E5E5E5]">
                          {job.category}
                        </span>

                        <span
                          className={`px-3 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] border ${
                            job.status === 'open'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                              : job.status === 'in_progress'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-800/80'
                              : 'bg-[#181818] text-[#A3A3A3] border-white/10'
                          }`}
                        >
                          {job.status === 'open' ? '● Open' : job.status === 'in_progress' ? '● Active Contract' : '● Completed'}
                        </span>

                        <span className="px-2.5 py-0.5 bg-[#0D0D0D] border border-white/10 text-[9px] text-[#A3A3A3] font-mono uppercase tracking-wider">
                          {job.experienceLevel}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-normal text-white group-hover:text-amber-400 transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-[#0D0D0D] p-4 border border-white/10">
                      <div className="text-xl font-serif font-light text-amber-400 font-mono">
                        {job.budgetEth} ETH
                      </div>
                      <div className="text-[10px] text-[#A3A3A3] font-mono tracking-wider">
                        ≈ ${(job.budgetEth * 2850).toLocaleString()} USD
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#A3A3A3] leading-relaxed line-clamp-2 font-sans font-light">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {job.skills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 border border-white/10 bg-[#0D0D0D] text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <img src={job.clientAvatar} alt={job.clientName} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                        <span className="text-[#E5E5E5] font-sans font-medium text-xs">{job.clientName}</span>
                      </div>
                      <span className="text-white/20">|</span>
                      <div className="flex items-center gap-1.5 text-[#A3A3A3] font-mono text-[10px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-[#666]" />
                        <span>{job.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[#A3A3A3] font-mono text-[10px] uppercase tracking-wider">
                        {job.applicantsCount} Bids
                      </span>
                      <button className="px-4 py-1.5 bg-[#161616] border border-white/20 hover:border-white text-white text-[10px] font-mono uppercase tracking-[0.15em] transition-colors flex items-center gap-1">
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
