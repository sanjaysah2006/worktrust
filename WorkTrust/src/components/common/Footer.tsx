import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ExternalLink, Code2, Lock, Cpu, Github, Twitter, Disc as Discord } from 'lucide-react';

export const Footer: React.FC = () => {
  const { switchView } = useApp();

  return (
    <footer className="border-t border-white/10 bg-[#080808] text-[#A3A3A3] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Col 1: Brand & Security */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => switchView('landing')}>
            <div className="w-8 h-8 rounded-full border border-white/30 bg-[#121212] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xl tracking-[0.2em] font-serif font-light text-white uppercase">
              Work<span className="font-semibold italic">Trust</span>
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed tracking-wide">
            Decentralized freelancing protocol powered by non-custodial smart contract escrow vaults, cryptographic deliverable verification, and multi-sig council arbitration.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-[#121212] border border-white/10 text-[#A3A3A3] hover:text-white hover:border-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-[#121212] border border-white/10 text-[#A3A3A3] hover:text-white hover:border-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-[#121212] border border-white/10 text-[#A3A3A3] hover:text-white hover:border-white transition-colors">
              <Discord className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Smart Contracts Verified */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-mono text-white uppercase tracking-[0.25em] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>On-Chain Verified</span>
          </h4>
          <ul className="space-y-2.5 text-xs font-mono">
            <li>
              <a
                href="https://sepolia.etherscan.io/address/0x8f2a9d81741f391a01c24e881029ba3931c07100"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#A3A3A3] hover:text-white transition-colors"
              >
                <span>EscrowFactory: 0x8f2a...7100</span>
                <ExternalLink className="w-3 h-3 text-[#666]" />
              </a>
            </li>
            <li>
              <a
                href="https://sepolia.etherscan.io/address/0x0000DAO19A214FE39B88019C00118AA901C99011"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#A3A3A3] hover:text-white transition-colors"
              >
                <span>MultiSigArbitrator: 0x0000...9011</span>
                <ExternalLink className="w-3 h-3 text-[#666]" />
              </a>
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider border border-emerald-800/60">
                <ShieldCheck className="w-3 h-3" /> CertiK & OpenZeppelin Audited
              </span>
            </li>
          </ul>
        </div>

        {/* Col 3: Navigation */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-mono text-white uppercase tracking-[0.25em] flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Protocol Views</span>
          </h4>
          <ul className="space-y-2 text-xs tracking-wider uppercase font-mono">
            <li>
              <button onClick={() => switchView('jobs')} className="text-[#A3A3A3] hover:text-white transition-colors">
                Browse Opportunities
              </button>
            </li>
            <li>
              <button onClick={() => switchView('post-job')} className="text-[#A3A3A3] hover:text-white transition-colors">
                Post Job with Escrow
              </button>
            </li>
            <li>
              <button onClick={() => switchView('transactions')} className="text-[#A3A3A3] hover:text-white transition-colors">
                Blockchain Explorer
              </button>
            </li>
            <li>
              <button onClick={() => switchView('admin-disputes')} className="text-[#A3A3A3] hover:text-white transition-colors">
                Dispute Court
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Network Gas Widget */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-mono text-white uppercase tracking-[0.25em] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Sepolia Network</span>
          </h4>
          <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A3A3A3]">Gas Price:</span>
              <span className="text-emerald-400 font-semibold">12 Gwei</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A3A3A3]">Block Time:</span>
              <span className="text-white">12.1s</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A3A3A3]">Escrow Factory:</span>
              <span className="text-cyan-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#666] font-mono uppercase tracking-[0.2em]">
        <div>© 2026 WorkTrust DAO. Immutable Smart Contracts On-Chain.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">IPFS Storage Specs</span>
        </div>
      </div>
    </footer>
  );
};
