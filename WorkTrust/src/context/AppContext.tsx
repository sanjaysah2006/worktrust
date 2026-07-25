import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  JobOpportunity,
  JobProposal,
  EscrowContract,
  DisputeCase,
  OnChainTx,
  NotificationToast,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_JOBS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  INITIAL_DISPUTES,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

export type ViewType =
  | 'landing'
  | 'jobs'
  | 'job-detail'
  | 'post-job'
  | 'client-dashboard'
  | 'freelancer-dashboard'
  | 'contract-workspace'
  | 'admin-disputes'
  | 'settings'
  | 'transactions';

interface AppContextType {
  currentView: ViewType;
  selectedJobId: string | null;
  selectedContractId: string | null;
  currentUser: UserProfile;
  wallet: {
    isConnected: boolean;
    address: string;
    network: string;
    balanceEth: number;
  };
  jobs: JobOpportunity[];
  proposals: JobProposal[];
  contracts: EscrowContract[];
  disputes: DisputeCase[];
  transactions: OnChainTx[];
  toasts: NotificationToast[];

  // Modal States
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  activeProposalJobId: string | null;
  setActiveProposalJobId: (jobId: string | null) => void;
  isFundModalOpen: boolean;
  setIsFundModalOpen: (open: boolean) => void;
  fundingContractId: string | null;
  setFundingContractId: (id: string | null) => void;
  isSubmitWorkModalOpen: boolean;
  setIsSubmitWorkModalOpen: (open: boolean) => void;
  isRaiseDisputeModalOpen: boolean;
  setIsRaiseDisputeModalOpen: (open: boolean) => void;

  // Actions
  switchView: (view: ViewType, id?: string) => void;
  switchUserRole: (role: UserRole) => void;
  connectWallet: (customAddress?: string) => void;
  disconnectWallet: () => void;
  addJob: (jobData: Omit<JobOpportunity, 'id' | 'postedDate' | 'applicantsCount' | 'status' | 'clientName' | 'clientAvatar' | 'clientAddress' | 'clientRating'>) => void;
  submitProposal: (proposalData: { jobId: string; jobTitle: string; coverLetter: string; bidEth: number; estimatedDays: number; portfolioUrl: string }) => void;
  hireFreelancer: (jobId: string, proposalId: string) => void;
  fundEscrowContract: (contractId: string) => Promise<void>;
  submitWork: (
    contractId: string,
    milestoneId: string,
    summary: string,
    repoUrl: string,
    deploymentUrl: string,
    files: { name: string; size: string; type: string }[]
  ) => void;
  approveAndReleaseFunds: (contractId: string, milestoneId: string) => Promise<void>;
  raiseDispute: (contractId: string, reason: string, explanation: string, evidenceUrls: string[]) => void;
  resolveDisputeAdmin: (disputeId: string, verdict: 'freelancer' | 'client' | 'split', notes: string) => void;
  requestSepoliaFaucet: () => void;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error', txHash?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [selectedJobId, setSelectedJobId] = useState<string | null>('job_1');
  const [selectedContractId, setSelectedContractId] = useState<string | null>('contract_1');

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS.client);
  const [wallet, setWallet] = useState({
    isConnected: true,
    address: INITIAL_USERS.client.walletAddress,
    network: 'Sepolia Testnet',
    balanceEth: 12.45,
  });

  // Data Store with LocalStorage Persistence
  const [jobs, setJobs] = useState<JobOpportunity[]>(() => {
    const saved = localStorage.getItem('worktrust_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [proposals, setProposals] = useState<JobProposal[]>(() => {
    const saved = localStorage.getItem('worktrust_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [contracts, setContracts] = useState<EscrowContract[]>(() => {
    const saved = localStorage.getItem('worktrust_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [disputes, setDisputes] = useState<DisputeCase[]>(() => {
    const saved = localStorage.getItem('worktrust_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [transactions, setTransactions] = useState<OnChainTx[]>(() => {
    const saved = localStorage.getItem('worktrust_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeProposalJobId, setActiveProposalJobId] = useState<string | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundingContractId, setFundingContractId] = useState<string | null>(null);
  const [isSubmitWorkModalOpen, setIsSubmitWorkModalOpen] = useState(false);
  const [isRaiseDisputeModalOpen, setIsRaiseDisputeModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('worktrust_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('worktrust_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('worktrust_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('worktrust_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('worktrust_txs', JSON.stringify(transactions));
  }, [transactions]);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    txHash?: string
  ) => {
    const newToast: NotificationToast = {
      id: 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      txHash,
    };
    setToasts((prev) => [newToast, ...prev]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchView = (view: ViewType, id?: string) => {
    setCurrentView(view);
    if (view === 'job-detail' && id) {
      setSelectedJobId(id);
    } else if (view === 'contract-workspace' && id) {
      setSelectedContractId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchUserRole = (role: UserRole) => {
    const userTemplate = INITIAL_USERS[role];
    setCurrentUser(userTemplate);
    setWallet((prev) => ({
      ...prev,
      address: userTemplate.walletAddress,
      balanceEth: role === 'client' ? 12.45 : role === 'freelancer' ? 8.92 : 45.0,
    }));
    addToast('Role Switched', `Active view context changed to ${role.toUpperCase()}`, 'info');

    if (role === 'client') {
      setCurrentView('client-dashboard');
    } else if (role === 'freelancer') {
      setCurrentView('freelancer-dashboard');
    } else {
      setCurrentView('admin-disputes');
    }
  };

  const connectWallet = (customAddress?: string) => {
    const addr = customAddress || currentUser.walletAddress;
    setWallet((prev) => ({
      ...prev,
      isConnected: true,
      address: addr,
    }));
    setIsWalletModalOpen(false);
    addToast('Web3 Wallet Connected', `Connected to ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)} on Sepolia Testnet`, 'success');
  };

  const disconnectWallet = () => {
    setWallet((prev) => ({
      ...prev,
      isConnected: false,
    }));
    addToast('Wallet Disconnected', 'Disconnected Web3 provider', 'info');
  };

  const addJob = (
    jobData: Omit<JobOpportunity, 'id' | 'postedDate' | 'applicantsCount' | 'status' | 'clientName' | 'clientAvatar' | 'clientAddress' | 'clientRating'>
  ) => {
    const newJobId = 'job_' + Date.now();
    const newJob: JobOpportunity = {
      ...jobData,
      id: newJobId,
      clientName: currentUser.name,
      clientAvatar: currentUser.avatar,
      clientAddress: currentUser.walletAddress,
      clientRating: currentUser.rating,
      postedDate: 'Just now',
      status: 'open',
      applicantsCount: 0,
      escrowProtected: true,
    };

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'Escrow Created',
      from: currentUser.walletAddress,
      to: 'WorkTrustEscrowFactory',
      amountEth: 0,
      status: 'Confirmed',
      blockNumber: 19842200 + Math.floor(Math.random() * 100),
      timestamp: 'Just now',
    };

    setJobs((prev) => [newJob, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    addToast(
      'Job Posted & Smart Contract Ready',
      `"${newJob.title}" deployed to Sepolia testnet. Ready for applicant bids.`,
      'success',
      newTx.txHash
    );
    switchView('job-detail', newJobId);
  };

  const submitProposal = (proposalData: {
    jobId: string;
    jobTitle: string;
    coverLetter: string;
    bidEth: number;
    estimatedDays: number;
    portfolioUrl: string;
  }) => {
    const newProp: JobProposal = {
      id: 'prop_' + Date.now(),
      jobId: proposalData.jobId,
      jobTitle: proposalData.jobTitle,
      freelancerId: currentUser.id,
      freelancerName: currentUser.name,
      freelancerAvatar: currentUser.avatar,
      freelancerAddress: currentUser.walletAddress,
      freelancerRating: currentUser.rating,
      coverLetter: proposalData.coverLetter,
      bidEth: proposalData.bidEth,
      estimatedDays: proposalData.estimatedDays,
      portfolioUrl: proposalData.portfolioUrl,
      status: 'pending',
      submittedAt: 'Just now',
    };

    setProposals((prev) => [newProp, ...prev]);

    // Increment applicants count
    setJobs((prev) =>
      prev.map((j) => (j.id === proposalData.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );

    addToast('Proposal Submitted', `Your application for "${proposalData.jobTitle}" has been sent to client.`, 'success');
  };

  const hireFreelancer = (jobId: string, proposalId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!job || !proposal) return;

    // Update proposal status
    setProposals((prev) =>
      prev.map((p) => (p.jobId === jobId ? { ...p, status: p.id === proposalId ? 'accepted' : 'rejected' } : p))
    );

    // Update job status
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'in_progress' } : j)));

    const newContractAddress =
      '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const createTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newContract: EscrowContract = {
      id: 'contract_' + Date.now(),
      contractAddress: newContractAddress,
      jobId: job.id,
      jobTitle: job.title,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientAddress: currentUser.walletAddress,
      freelancerId: proposal.freelancerId,
      freelancerName: proposal.freelancerName,
      freelancerAddress: proposal.freelancerAddress,
      agreedAmountEth: proposal.bidEth,
      escrowBalanceEth: 0, // Unfunded initially until client funds
      status: 'created',
      createdTxHash: createTxHash,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: 'Just now',
      milestones: job.milestones.map((ms) => ({
        ...ms,
        status: 'pending',
      })),
      submissions: [],
    };

    setContracts((prev) => [newContract, ...prev]);

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: createTxHash,
      type: 'Escrow Created',
      from: currentUser.walletAddress,
      to: newContractAddress,
      amountEth: proposal.bidEth,
      status: 'Confirmed',
      blockNumber: 19842250,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Set funding modal to prompt user to fund escrow immediately
    setFundingContractId(newContract.id);
    setIsFundModalOpen(true);
    addToast('Freelancer Hired', `Contract initialized for ${proposal.freelancerName}. Please fund escrow.`, 'success', createTxHash);
  };

  const fundEscrowContract = async (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const fundTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Deduct ETH from wallet balance
    setWallet((prev) => ({
      ...prev,
      balanceEth: Math.max(0, prev.balanceEth - contract.agreedAmountEth),
    }));

    // Update contract status
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              escrowBalanceEth: c.agreedAmountEth,
              status: 'funded',
              fundedTxHash: fundTxHash,
              milestones: c.milestones.map((m, idx) => (idx === 0 ? { ...m, status: 'funded' } : m)),
              updatedAt: 'Just now',
            }
          : c
      )
    );

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: fundTxHash,
      type: 'Escrow Funded',
      from: wallet.address,
      to: contract.contractAddress,
      amountEth: contract.agreedAmountEth,
      status: 'Confirmed',
      blockNumber: 19842280,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast(
      'Escrow Funded On-Chain',
      `${contract.agreedAmountEth} ETH locked securely in smart contract ${contract.contractAddress.substring(0, 10)}...`,
      'success',
      fundTxHash
    );
  };

  const submitWork = (
    contractId: string,
    milestoneId: string,
    summary: string,
    repoUrl: string,
    deploymentUrl: string,
    files: { name: string; size: string; type: string }[]
  ) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const submitTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newSubmission = {
      id: 'sub_' + Date.now(),
      contractId,
      summary,
      repoUrl,
      deploymentUrl,
      files,
      submittedAt: new Date().toISOString(),
    };

    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: 'milestone_submitted',
              submissions: [newSubmission, ...c.submissions],
              milestones: c.milestones.map((m) =>
                m.id === milestoneId || (!m.id && milestoneId)
                  ? {
                      ...m,
                      status: 'submitted',
                      submissionNotes: summary,
                      deliverableUrl: deploymentUrl || repoUrl,
                      submittedAt: 'Just now',
                    }
                  : m
              ),
              updatedAt: 'Just now',
            }
          : c
      )
    );

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: submitTxHash,
      type: 'Work Submitted',
      from: currentUser.walletAddress,
      to: contract.contractAddress,
      amountEth: 0,
      status: 'Confirmed',
      blockNumber: 19842310,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsSubmitWorkModalOpen(false);
    addToast('Deliverables Submitted', 'Work proof broadcast to smart contract. Client notified for approval.', 'success', submitTxHash);
  };

  const approveAndReleaseFunds = async (contractId: string, milestoneId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const releaseTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const targetMs = contract.milestones.find((m) => m.id === milestoneId) || contract.milestones[0];
    const amountToRelease = targetMs ? targetMs.amountEth : contract.escrowBalanceEth;

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedMs = c.milestones.map((m) => (m.id === milestoneId ? { ...m, status: 'released' as const } : m));
        const allReleased = updatedMs.every((m) => m.status === 'released');

        return {
          ...c,
          escrowBalanceEth: Math.max(0, c.escrowBalanceEth - amountToRelease),
          status: allReleased ? ('funds_released' as const) : ('in_progress' as const),
          releasedTxHash: releaseTxHash,
          milestones: updatedMs,
          updatedAt: 'Just now',
        };
      })
    );

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: releaseTxHash,
      type: 'Funds Released',
      from: contract.contractAddress,
      to: contract.freelancerAddress,
      amountEth: amountToRelease,
      status: 'Confirmed',
      blockNumber: 19842350,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast(
      'Funds Released to Freelancer',
      `${amountToRelease} ETH transferred directly to freelancer wallet ${contract.freelancerAddress.substring(0, 8)}...`,
      'success',
      releaseTxHash
    );
  };

  const raiseDispute = (contractId: string, reason: string, explanation: string, evidenceUrls: string[]) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const disputeId = 'disp_' + Date.now();
    const newDispute: DisputeCase = {
      id: disputeId,
      contractId,
      jobTitle: contract.jobTitle,
      clientAddress: contract.clientAddress,
      freelancerAddress: contract.freelancerAddress,
      clientName: contract.clientName,
      freelancerName: contract.freelancerName,
      reason,
      explanation,
      evidenceUrls,
      amountEth: contract.escrowBalanceEth,
      status: 'pending_admin',
      createdAt: 'Just now',
    };

    setDisputes((prev) => [newDispute, ...prev]);

    // Freeze contract in disputed state
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: 'disputed',
              disputeReason: reason,
              disputeNotes: explanation,
              updatedAt: 'Just now',
            }
          : c
      )
    );

    const disputeTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: disputeTxHash,
      type: 'Dispute Opened',
      from: currentUser.walletAddress,
      to: contract.contractAddress,
      amountEth: contract.escrowBalanceEth,
      status: 'Confirmed',
      blockNumber: 19842380,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsRaiseDisputeModalOpen(false);
    addToast(
      'Dispute Escalated to Arbitration',
      'Escrow funds frozen. WorkTrust Admin Council notified for evidence review.',
      'warning',
      disputeTxHash
    );
  };

  const resolveDisputeAdmin = (disputeId: string, verdict: 'freelancer' | 'client' | 'split', notes: string) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;

    const statusMap = {
      freelancer: 'resolved_freelancer' as const,
      client: 'resolved_client' as const,
      split: 'split' as const,
    };

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: statusMap[verdict],
              adminNotes: notes,
              resolvedAt: 'Just now',
            }
          : d
      )
    );

    // Update contract status
    setContracts((prev) =>
      prev.map((c) =>
        c.id === dispute.contractId
          ? {
              ...c,
              status: 'resolved',
              escrowBalanceEth: 0,
              updatedAt: 'Just now',
            }
          : c
      )
    );

    const resolveTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: resolveTxHash,
      type: 'Dispute Resolved',
      from: 'WorkTrustArbitrationMultiSig',
      to: verdict === 'freelancer' ? dispute.freelancerAddress : dispute.clientAddress,
      amountEth: dispute.amountEth,
      status: 'Confirmed',
      blockNumber: 19842400,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast(
      'Dispute Resolved by Multi-Sig Verdict',
      `Verdict: ${verdict.toUpperCase()}. ${dispute.amountEth} ETH distributed per multi-sig signature.`,
      'success',
      resolveTxHash
    );
  };

  const requestSepoliaFaucet = () => {
    setWallet((prev) => ({
      ...prev,
      balanceEth: prev.balanceEth + 1.0,
    }));
    const faucetTxHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: OnChainTx = {
      id: 'tx_' + Date.now(),
      txHash: faucetTxHash,
      type: 'Escrow Funded',
      from: 'SepoliaFaucetContract',
      to: wallet.address,
      amountEth: 1.0,
      status: 'Confirmed',
      blockNumber: 19842410,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast('Sepolia Testnet ETH Received', '1.0 Sepolia ETH added to your Web3 wallet balance.', 'success', faucetTxHash);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedJobId,
        selectedContractId,
        currentUser,
        wallet,
        jobs,
        proposals,
        contracts,
        disputes,
        transactions,
        toasts,

        isWalletModalOpen,
        setIsWalletModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeProposalJobId,
        setActiveProposalJobId,
        isFundModalOpen,
        setIsFundModalOpen,
        fundingContractId,
        setFundingContractId,
        isSubmitWorkModalOpen,
        setIsSubmitWorkModalOpen,
        isRaiseDisputeModalOpen,
        setIsRaiseDisputeModalOpen,

        switchView,
        switchUserRole,
        connectWallet,
        disconnectWallet,
        addJob,
        submitProposal,
        hireFreelancer,
        fundEscrowContract,
        submitWork,
        approveAndReleaseFunds,
        raiseDispute,
        resolveDisputeAdmin,
        requestSepoliaFaucet,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
