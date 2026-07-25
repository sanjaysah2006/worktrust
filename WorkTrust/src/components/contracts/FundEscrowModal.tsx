import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Coins,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';

export const FundEscrowModal: React.FC = () => {
  const {
    isFundModalOpen,
    setIsFundModalOpen,
    fundingContractId,
    contracts,
    fundEscrowContract,
    wallet
  } = useApp();

  const [step, setStep] = useState<'confirm' | 'signing' | 'broadcasting' | 'success'>('confirm');

  if (!isFundModalOpen || !fundingContractId) return null;

  const contract = contracts.find((c) => c.id === fundingContractId);
  if (!contract) return null;

  const handleConfirmFunding = async () => {
    setStep('signing');
    setTimeout(() => {
      setStep('broadcasting');
      setTimeout(async () => {
        await fundEscrowContract(contract.id);
        setStep('success');
        setTimeout(() => {
          setIsFundModalOpen(false);
          setStep('confirm');
        }, 1500);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0D0D0D] text-amber-400 border border-white/10">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-normal text-white uppercase tracking-wider">Fund Escrow Vault</h3>
              <p className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">Lock ETH into non-custodial vault</p>
            </div>
          </div>
          <button
            onClick={() => setIsFundModalOpen(false)}
            className="text-[#A3A3A3] hover:text-white p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="p-5 bg-[#0D0D0D] border border-white/10 space-y-3 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-[#A3A3A3]">Opportunity:</span>
                <span className="text-white font-medium">{contract.jobTitle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A3A3A3]">Freelancer:</span>
                <span className="text-white">{contract.freelancerName}</span>
              </div>
              <div className="flex justify-between text-xs pt-3 border-t border-white/10">
                <span className="text-[#A3A3A3]">Deposit Required:</span>
                <span className="text-amber-400 font-serif font-light text-base">{contract.agreedAmountEth} ETH</span>
              </div>
            </div>

            <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Wallet Balance:</span>
                <span className="text-emerald-400 font-bold">{wallet.balanceEth.toFixed(2)} Sepolia ETH</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Network Gas Est:</span>
                <span className="text-[#E5E5E5]">~0.0012 ETH (12 Gwei)</span>
              </div>
            </div>

            <button
              onClick={handleConfirmFunding}
              disabled={wallet.balanceEth < contract.agreedAmountEth}
              className="w-full py-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 font-sans font-semibold text-xs uppercase tracking-[0.2em] transition-all shadow"
            >
              Confirm & Deposit {contract.agreedAmountEth} ETH
            </button>
          </div>
        )}

        {(step === 'signing' || step === 'broadcasting') && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div>
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white">
                {step === 'signing' ? 'Awaiting Signature...' : 'Broadcasting Transaction...'}
              </h4>
              <p className="text-xs text-[#A3A3A3] mt-1 font-sans font-light">
                {step === 'signing' ? 'Please approve the transaction in your Web3 wallet' : '2/3 Block confirmations received'}
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Escrow Vault Funded</h4>
            <p className="text-xs text-[#A3A3A3] font-sans font-light">{contract.agreedAmountEth} ETH locked securely in smart contract.</p>
          </div>
        )}
      </div>
    </div>
  );
};
