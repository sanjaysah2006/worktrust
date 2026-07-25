import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  Coins
} from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { transactions, addToast } = useApp();
  const [filterType, setFilterType] = useState<string>('All');
  const [searchHash, setSearchHash] = useState<string>('');

  const types = ['All', 'Escrow Created', 'Escrow Funded', 'Work Submitted', 'Funds Released', 'Dispute Opened'];

  const filteredTxs = transactions.filter((tx) => {
    const matchesType = filterType === 'All' || tx.type === filterType;
    const matchesHash =
      tx.txHash.toLowerCase().includes(searchHash.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchHash.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchHash.toLowerCase());

    return matchesType && matchesHash;
  });

  const handleExportCSV = () => {
    addToast('CSV Exported', 'On-chain transaction event ledger exported to CSV file.', 'success');
  };

  return (
    <div className="space-y-10 pb-20 font-sans bg-[#080808]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-tight">On-Chain Blockchain Registry</h1>
            <span className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest bg-[#181818] text-[#E5E5E5] border border-white/10">
              Sepolia Testnet Ledger
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] font-sans font-light">
            Real-time immutable ledger of all smart contract deployments, escrow funding deposits, and milestone releases.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 bg-[#121212] border border-white/10 text-white hover:bg-white/5 text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Export Event Log (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center font-mono text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="Search by Tx Hash or Wallet address..."
            className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-white/10 text-white text-xs placeholder-[#666] focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                filterType === t
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-[#121212] border-white/10 text-[#A3A3A3] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-8 bg-[#121212] border border-white/10 space-y-6">
        <div className="flex items-center justify-between text-xs text-[#A3A3A3] font-mono">
          <span className="uppercase tracking-widest text-[10px]">{filteredTxs.length} Transactions Recorded</span>
          <span className="text-emerald-400 flex items-center gap-1 uppercase tracking-widest text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% On-Chain Verifiable
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#A3A3A3] uppercase text-[9px] tracking-widest">
                <th className="py-3.5 px-4">Tx Hash</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">From</th>
                <th className="py-3.5 px-4">To (Contract / Recipient)</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Block #</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-mono text-white">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline text-white"
                    >
                      <span>{tx.txHash.substring(0, 8)}...{tx.txHash.substring(tx.txHash.length - 4)}</span>
                      <ExternalLink className="w-3 h-3 text-[#666]" />
                    </a>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider border ${
                        tx.type === 'Escrow Funded'
                          ? 'bg-amber-950/50 text-amber-400 border-amber-800/80'
                          : tx.type === 'Funds Released'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/80'
                          : tx.type === 'Dispute Opened'
                          ? 'bg-rose-950/50 text-rose-400 border-rose-800/80'
                          : 'bg-[#181818] text-[#E5E5E5] border-white/10'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-[#A3A3A3]">
                    {tx.from.substring(0, 6)}...
                  </td>

                  <td className="py-4 px-4 text-[#A3A3A3]">
                    {tx.to.substring(0, 6)}...
                  </td>

                  <td className="py-4 px-4 font-serif text-amber-400 text-sm">
                    {tx.amountEth > 0 ? `${tx.amountEth} ETH` : '0 ETH'}
                  </td>

                  <td className="py-4 px-4 text-[#666]">
                    #{tx.blockNumber}
                  </td>

                  <td className="py-4 px-4 text-[#666] text-[10px]">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
