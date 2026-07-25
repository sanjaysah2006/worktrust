import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Wallet,
  ShieldCheck,
  Plus,
  Trash2,
  Droplets,
  Copy,
  CheckCircle2,
  Save,
  Check
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, wallet, requestSepoliaFaucet, addToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState(currentUser.bio);
  const [skills, setSkills] = useState<string[]>(currentUser.skills);
  const [newSkill, setNewSkill] = useState('');
  const [copied, setCopied] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    addToast('Address Copied', 'Wallet address copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile Updated', 'Your Web3 identity and skills settings have been saved.', 'success');
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto font-sans bg-[#080808]">
      <div className="border-b border-white/10 pb-6 space-y-1">
        <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.3em]">USER SETTINGS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">
          Profile & Wallet Settings
        </h1>
        <p className="text-xs text-[#A3A3A3] font-sans font-light">
          Manage your decentralized identity, skill certifications, and connected Web3 wallet.
        </p>
      </div>

      <div className="space-y-8">
        {/* Connected Wallet Section */}
        <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3] flex items-center gap-2 border-b border-white/10 pb-3">
            <Wallet className="w-4 h-4 text-white" />
            <span>Connected Web3 Wallet</span>
          </h3>

          <div className="p-5 bg-[#0D0D0D] border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A3A3A3] uppercase tracking-wider text-[10px]">Wallet Address:</span>
              <div className="flex items-center gap-2 text-white">
                <span>{wallet.address}</span>
                <button onClick={handleCopy} className="text-[#A3A3A3] hover:text-white transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#A3A3A3] uppercase tracking-wider text-[10px]">Active Network:</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider">{wallet.network}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[#A3A3A3] uppercase tracking-wider text-[10px]">Testnet Balance:</span>
              <span className="text-amber-400 font-serif font-light text-base">{wallet.balanceEth.toFixed(4)} Sepolia ETH</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-white/10">
            <div>
              <span className="text-xs font-serif font-normal text-white uppercase tracking-wider block">Need Testnet Gas?</span>
              <p className="text-[11px] text-[#A3A3A3] font-mono">Request 1.0 Sepolia ETH for smart contract testing</p>
            </div>
            <button
              onClick={requestSepoliaFaucet}
              className="px-5 py-2.5 bg-white text-black font-sans font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-all"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Request +1 ETH</span>
            </button>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="p-8 bg-[#121212] border border-white/10 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#A3A3A3] flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-white" />
            <span>Decentralized Identity & Bio</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Email (Optional Notifications)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="font-mono text-xs">
            <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block mb-1">Bio / Web3 Credentials</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
            />
          </div>

          {/* Skill Tag Manager */}
          <div className="space-y-3 font-mono text-xs">
            <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block">Skill Certifications & Tags</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill tag (e.g., Circom, Foundry)..."
                className="flex-1 p-3.5 bg-[#0D0D0D] border border-white/10 text-white text-xs focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-5 py-3.5 bg-[#181818] border border-white/10 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1 hover:border-white"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span key={skill} className="px-3.5 py-1.5 bg-[#181818] border border-white/10 text-xs text-[#E5E5E5] font-mono flex items-center gap-2 uppercase tracking-wider">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-[#666] hover:text-rose-400 text-xs">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
