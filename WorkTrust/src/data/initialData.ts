import { UserProfile, JobOpportunity, JobProposal, EscrowContract, DisputeCase, OnChainTx } from '../types';

export const INITIAL_USERS: Record<string, UserProfile> = {
  client: {
    id: 'user_client_1',
    name: 'Alex Mercer',
    email: 'alex.mercer@aetherlabs.io',
    role: 'client',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder at Aether Protocol. Building next-gen DeFi liquidity aggregation engines.',
    rating: 4.95,
    completedJobs: 14,
    totalEth: 18.4,
    skills: ['DeFi Strategy', 'Project Management', 'Solidity', 'Architecture'],
    joinedDate: 'Jan 2024',
    isConnected: true,
  },
  freelancer: {
    id: 'user_freelancer_1',
    name: 'Elena Rostova',
    email: 'elena.codes@ethmail.cc',
    role: 'freelancer',
    walletAddress: '0x38F1428a9B8018C442B558C08422A9bA82e481B4',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Web3 & Solidity Engineer. 6+ yrs auditing smart contracts, building ZK-SNARK circuits & Wagmi dApps.',
    rating: 4.98,
    completedJobs: 28,
    totalEth: 42.5,
    skills: ['Solidity', 'React', 'Ethers.js', 'Hardhat', 'Foundry', 'TypeScript', 'Rust'],
    joinedDate: 'Nov 2023',
    isConnected: true,
  },
  admin: {
    id: 'user_admin_1',
    name: 'Satoshi Sentinel',
    email: 'arbitration@worktrust.dao',
    role: 'admin',
    walletAddress: '0x0000DAO19A214FE39B88019C00118AA901C99011',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'WorkTrust Lead Decentralized Arbitrator. DAO-elected multi-sig security council member.',
    rating: 5.0,
    completedJobs: 142,
    totalEth: 120.0,
    skills: ['Arbitration', 'Contract Analysis', 'Security Audit', 'Web3 Law'],
    joinedDate: 'Oct 2023',
    isConnected: true,
  },
};

export const INITIAL_JOBS: JobOpportunity[] = [
  {
    id: 'job_1',
    title: 'Solidity Smart Contract Audit for DeFi Yield Protocol',
    clientName: 'Alex Mercer',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientAddress: '0x71C7...976F',
    clientRating: 4.95,
    category: 'Audit & Security',
    budgetEth: 3.5,
    duration: '2 Weeks',
    experienceLevel: 'Expert',
    description: 'We require a comprehensive security audit for our ERC-4626 vault yield aggregator and cross-chain rebalancing contracts written in Solidity 0.8.20 using Foundry. Audit must include slither analysis, formal verification report, and recommended gas optimization patches.',
    deliverables: [
      'Comprehensive PDF Audit Report detailing high/med/low vulnerabilities',
      'Gas optimization recommendation matrix with benchmark comparisons',
      'Proof-of-Concept exploit scripts written in Foundry for identified issues',
      'Re-audit sign-off after vulnerability remedies are deployed'
    ],
    skills: ['Solidity', 'Foundry', 'Slither', 'DeFi Vaults', 'Security Audit'],
    postedDate: '2 days ago',
    status: 'in_progress',
    applicantsCount: 6,
    escrowProtected: true,
    contractAddress: '0x8f2a9...31c0',
    milestones: [
      {
        id: 'ms_1_1',
        title: 'Initial Codebase Review & Automated Scan Report',
        amountEth: 1.5,
        dueDate: 'May 12, 2026',
        status: 'submitted',
        submissionNotes: 'Completed Slither and Mythril automated scans. Initial report draft uploaded to IPFS.',
        deliverableUrl: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        submittedAt: 'Today, 14:32 UTC'
      },
      {
        id: 'ms_1_2',
        title: 'Final Audit Report & PoC Exploit Foundry Tests',
        amountEth: 2.0,
        dueDate: 'May 20, 2026',
        status: 'funded',
      }
    ]
  },
  {
    id: 'job_2',
    title: 'Full-Stack Web3 DApp Development with React & Wagmi v2',
    clientName: 'Aura Protocol',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    clientAddress: '0x992B...811A',
    clientRating: 4.88,
    category: 'Full Stack Web3',
    budgetEth: 2.8,
    duration: '3 Weeks',
    experienceLevel: 'Intermediate',
    description: 'Looking for an experienced Web3 developer to build a slick responsive frontend for an automated options vault protocol. Must support WalletConnect v2, RainbowKit, and real-time WebSocket state updates using Viem/Wagmi.',
    deliverables: [
      'Clean React 19 + TypeScript frontend with Tailwind CSS styling',
      'Seamless multi-wallet connector (MetaMask, Coinbase, Phantom EVM)',
      'Real-time transaction status toasts and contract write hooks',
      'Deployed Vercel preview with full integration tests'
    ],
    skills: ['React', 'TypeScript', 'Wagmi', 'Tailwind CSS', 'Viem', 'Web3.js'],
    postedDate: '1 day ago',
    status: 'open',
    applicantsCount: 9,
    escrowProtected: true,
    milestones: [
      {
        id: 'ms_2_1',
        title: 'UI Component Architecture & Wallet Integration',
        amountEth: 1.0,
        dueDate: 'May 18, 2026',
        status: 'pending'
      },
      {
        id: 'ms_2_2',
        title: 'Smart Contract Integration & Live Deployment',
        amountEth: 1.8,
        dueDate: 'May 28, 2026',
        status: 'pending'
      }
    ]
  },
  {
    id: 'job_3',
    title: 'Zero-Knowledge Proof ZK-Rollup Circuit Engineer',
    clientName: 'ZK-Nexus Labs',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    clientAddress: '0x442A...9010',
    clientRating: 5.0,
    category: 'ZK & Cryptography',
    budgetEth: 5.0,
    duration: '1 Month',
    experienceLevel: 'Expert',
    description: 'Seeking a ZK circuit specialist to implement Circom circuits for a privacy-preserving identity verification protocol on Ethereum. Needs groth16 verifier smart contract generation and snarkjs frontend proof creation.',
    deliverables: [
      'Circom circuits for identity Merkle root membership proof',
      'Auto-generated Solidity Groth16 Verifier contract',
      'TypeScript browser proof generation client package'
    ],
    skills: ['Circom', 'snarkjs', 'Zero-Knowledge', 'Solidity', 'Rust'],
    postedDate: '3 days ago',
    status: 'open',
    applicantsCount: 4,
    escrowProtected: true,
    milestones: [
      {
        id: 'ms_3_1',
        title: 'Circuit Design & Test Suite',
        amountEth: 2.5,
        dueDate: 'May 25, 2026',
        status: 'pending'
      },
      {
        id: 'ms_3_2',
        title: 'On-Chain Verifier & Frontend Proof Client',
        amountEth: 2.5,
        dueDate: 'Jun 10, 2026',
        status: 'pending'
      }
    ]
  },
  {
    id: 'job_4',
    title: 'NFT Marketplace Smart Contract & Dynamic Royalty Engine',
    clientName: 'Vortex Art DAO',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    clientAddress: '0x129B...339A',
    clientRating: 4.92,
    category: 'Smart Contracts',
    budgetEth: 1.5,
    duration: '1 Week',
    experienceLevel: 'Intermediate',
    description: 'Build ERC-721A minting contracts with ERC-2981 royalty standards and dynamic marketplace listing/bidding logic. Gas optimization is a primary requirement.',
    deliverables: [
      'Gas-optimized ERC-721A smart contract',
      'Marketplace contract with Dutch Auction support',
      'Hardhat test suite with 100% coverage'
    ],
    skills: ['Solidity', 'ERC-721A', 'Hardhat', 'OpenZeppelin'],
    postedDate: '4 hours ago',
    status: 'open',
    applicantsCount: 12,
    escrowProtected: true,
    milestones: [
      {
        id: 'ms_4_1',
        title: 'Contracts & Test Suite',
        amountEth: 1.5,
        dueDate: 'May 14, 2026',
        status: 'pending'
      }
    ]
  },
  {
    id: 'job_5',
    title: 'Cross-Chain Liquidity Bridge Frontend & Monitoring Dashboard',
    clientName: 'Hyperion Bridge',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    clientAddress: '0x5501...FE21',
    clientRating: 4.79,
    category: 'Frontend & DApp',
    budgetEth: 4.2,
    duration: '4 Weeks',
    experienceLevel: 'Expert',
    description: 'Build an intuitive cross-chain asset bridging widget with LayerZero and Chainlink CCIP support. Includes active transaction tracking and slippage tolerance controls.',
    deliverables: [
      'Interactive bridge interface with real-time route gas estimation',
      'LayerZero / CCIP messaging state tracker component',
      'Tailwind CSS custom dark/light theme integration'
    ],
    skills: ['React', 'Next.js', 'LayerZero', 'Ethers.js', 'Recharts'],
    postedDate: '5 days ago',
    status: 'completed',
    applicantsCount: 15,
    escrowProtected: true,
    contractAddress: '0x4421...900f',
    milestones: [
      {
        id: 'ms_5_1',
        title: 'Bridge Interface & Routing Engine',
        amountEth: 2.1,
        dueDate: 'Apr 20, 2026',
        status: 'released'
      },
      {
        id: 'ms_5_2',
        title: 'Cross-Chain Relayer Status Monitor',
        amountEth: 2.1,
        dueDate: 'May 01, 2026',
        status: 'released'
      }
    ]
  }
];

export const INITIAL_PROPOSALS: JobProposal[] = [
  {
    id: 'prop_1',
    jobId: 'job_1',
    jobTitle: 'Solidity Smart Contract Audit for DeFi Yield Protocol',
    freelancerId: 'user_freelancer_1',
    freelancerName: 'Elena Rostova',
    freelancerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    freelancerAddress: '0x38F1...81B4',
    freelancerRating: 4.98,
    coverLetter: 'I have conducted over 25 smart contract audits for top-tier DeFi protocols on Ethereum and Arbitrum. My process involves automated Slither/Mythril analysis, manual line-by-line inspection, and writing custom Foundry exploit test cases to verify edge cases in yield compounding.',
    bidEth: 3.5,
    estimatedDays: 14,
    portfolioUrl: 'https://github.com/elena-solidity-security/audits',
    status: 'accepted',
    submittedAt: '3 days ago'
  },
  {
    id: 'prop_2',
    jobId: 'job_2',
    jobTitle: 'Full-Stack Web3 DApp Development with React & Wagmi v2',
    freelancerId: 'user_freelancer_1',
    freelancerName: 'Elena Rostova',
    freelancerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    freelancerAddress: '0x38F1...81B4',
    freelancerRating: 4.98,
    coverLetter: 'Hi Aura team! I built 4 production dApps using Wagmi v2 and Viem. I can deliver a crisp, ultra-responsive UI with smooth state management and custom gas estimations for your options vault.',
    bidEth: 2.8,
    estimatedDays: 20,
    portfolioUrl: 'https://dapp-portfolio.eth.limo',
    status: 'pending',
    submittedAt: 'Yesterday, 18:40 UTC'
  },
  {
    id: 'prop_3',
    jobId: 'job_2',
    jobTitle: 'Full-Stack Web3 DApp Development with React & Wagmi v2',
    freelancerId: 'user_freelancer_2',
    freelancerName: 'BlockGuardian Labs',
    freelancerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    freelancerAddress: '0x90A1...3110',
    freelancerRating: 4.90,
    coverLetter: 'We are a specialized Web3 agency of 3 engineers. We can deliver your dApp in under 2 weeks with full mobile responsive design and automated Cypress E2E testing.',
    bidEth: 2.6,
    estimatedDays: 14,
    portfolioUrl: 'https://blockguardian.io',
    status: 'pending',
    submittedAt: '12 hours ago'
  }
];

export const INITIAL_CONTRACTS: EscrowContract[] = [
  {
    id: 'contract_1',
    contractAddress: '0x8f2a9d81741f391a01c24e881029ba3931c07100',
    jobId: 'job_1',
    jobTitle: 'Solidity Smart Contract Audit for DeFi Yield Protocol',
    clientId: 'user_client_1',
    clientName: 'Alex Mercer',
    clientAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    freelancerId: 'user_freelancer_1',
    freelancerName: 'Elena Rostova',
    freelancerAddress: '0x38F1428a9B8018C442B558C08422A9bA82e481B4',
    agreedAmountEth: 3.5,
    escrowBalanceEth: 3.5,
    status: 'milestone_submitted',
    createdTxHash: '0xa419e0129b8c34f190771212ab091c88721bf9012390a19028a1928391823901',
    fundedTxHash: '0x71a28f918203192083a910283019283019283019283019283019283019283019',
    createdAt: 'May 02, 2026',
    updatedAt: 'May 05, 2026',
    milestones: [
      {
        id: 'ms_1_1',
        title: 'Initial Codebase Review & Automated Scan Report',
        amountEth: 1.5,
        dueDate: 'May 12, 2026',
        status: 'submitted',
        submissionNotes: 'Completed Slither and Mythril automated scans. Initial report draft uploaded to IPFS.',
        deliverableUrl: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        submittedAt: 'Today, 14:32 UTC'
      },
      {
        id: 'ms_1_2',
        title: 'Final Audit Report & PoC Exploit Foundry Tests',
        amountEth: 2.0,
        dueDate: 'May 20, 2026',
        status: 'funded'
      }
    ],
    submissions: [
      {
        id: 'sub_1',
        contractId: 'contract_1',
        summary: 'Completed deep Slither scan and preliminary static analysis for vault compounding contract. Identified 2 Medium vulnerabilities (Reentrancy in emergency withdraw and Unchecked ERC20 transfer return value). Detailed remediation steps provided in IPFS draft.',
        repoUrl: 'https://github.com/elena-solidity-security/yield-vault-audit',
        deploymentUrl: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        files: [
          { name: 'Slither_Scan_Summary.pdf', size: '2.4 MB', type: 'application/pdf' },
          { name: 'Foundry_Reentrancy_PoC.t.sol', size: '14.2 KB', type: 'text/plain' }
        ],
        submittedAt: 'May 05, 2026, 14:32 UTC'
      }
    ]
  }
];

export const INITIAL_DISPUTES: DisputeCase[] = [
  {
    id: 'disp_101',
    contractId: 'contract_demo_dispute',
    jobTitle: 'NFT Marketplace Royalty Contract Fix',
    clientAddress: '0x8831...991A',
    freelancerAddress: '0x221A...3100',
    clientName: 'CyberPunks Inc.',
    freelancerName: 'David Dev',
    reason: 'Incomplete Deliverable & Missed Deadline',
    explanation: 'Freelancer submitted incomplete code without test coverage or ERC-2981 royalty calculations as agreed in contract scope.',
    evidenceUrls: [
      'https://github.com/client-repo/marketplace/issues/42',
      'https://ipfs.io/ipfs/QmEvidenceDocumentScreenCapture'
    ],
    amountEth: 2.0,
    status: 'pending_admin',
    createdAt: 'May 03, 2026'
  }
];

export const INITIAL_TRANSACTIONS: OnChainTx[] = [
  {
    id: 'tx_1',
    txHash: '0x71a28f918203192083a910283019283019283019283019283019283019283019',
    type: 'Escrow Funded',
    from: '0x71C7...976F',
    to: '0x8f2a9...7100',
    amountEth: 3.5,
    status: 'Confirmed',
    blockNumber: 19842109,
    timestamp: 'May 02, 2026, 11:20 UTC'
  },
  {
    id: 'tx_2',
    txHash: '0xa419e0129b8c34f190771212ab091c88721bf9012390a19028a1928391823901',
    type: 'Escrow Created',
    from: '0x71C7...976F',
    to: 'WorkTrustEscrowFactory',
    amountEth: 0.0,
    status: 'Confirmed',
    blockNumber: 19842001,
    timestamp: 'May 02, 2026, 10:45 UTC'
  },
  {
    id: 'tx_3',
    txHash: '0x99281a9028192830192830192830192830192830192830192830192830192830',
    type: 'Funds Released',
    from: 'WorkTrustEscrowFactory',
    to: '0x38F1...81B4',
    amountEth: 4.2,
    status: 'Confirmed',
    blockNumber: 19810232,
    timestamp: 'May 01, 2026, 16:10 UTC'
  }
];
