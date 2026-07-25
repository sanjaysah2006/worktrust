export type UserRole = 'client' | 'freelancer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  avatar: string;
  bio: string;
  rating: number;
  completedJobs: number;
  totalEth: number;
  skills: string[];
  joinedDate: string;
  isConnected: boolean;
}

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';
export type ExperienceLevel = 'Entry' | 'Intermediate' | 'Expert';

export interface Milestone {
  id: string;
  title: string;
  amountEth: number;
  dueDate: string;
  status: 'pending' | 'funded' | 'submitted' | 'released' | 'disputed';
  submissionNotes?: string;
  deliverableUrl?: string;
  submittedAt?: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  clientAddress: string;
  clientRating: number;
  category: string;
  budgetEth: number;
  duration: string;
  experienceLevel: ExperienceLevel;
  description: string;
  deliverables: string[];
  skills: string[];
  postedDate: string;
  status: JobStatus;
  applicantsCount: number;
  escrowProtected: boolean;
  contractAddress?: string;
  milestones: Milestone[];
}

export interface JobProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerAddress: string;
  freelancerRating: number;
  coverLetter: string;
  bidEth: number;
  estimatedDays: number;
  portfolioUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface WorkSubmission {
  id: string;
  contractId: string;
  summary: string;
  repoUrl?: string;
  deploymentUrl?: string;
  files: { name: string; size: string; type: string }[];
  submittedAt: string;
}

export type EscrowStatus =
  | 'created'
  | 'funded'
  | 'in_progress'
  | 'milestone_submitted'
  | 'funds_released'
  | 'disputed'
  | 'resolved';

export interface EscrowContract {
  id: string;
  contractAddress: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAddress: string;
  agreedAmountEth: number;
  escrowBalanceEth: number;
  status: EscrowStatus;
  createdTxHash: string;
  fundedTxHash?: string;
  releasedTxHash?: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  submissions: WorkSubmission[];
  disputeReason?: string;
  disputeNotes?: string;
}

export interface DisputeCase {
  id: string;
  contractId: string;
  jobTitle: string;
  clientAddress: string;
  freelancerAddress: string;
  clientName: string;
  freelancerName: string;
  reason: string;
  explanation: string;
  evidenceUrls: string[];
  amountEth: number;
  status: 'pending_admin' | 'resolved_freelancer' | 'resolved_client' | 'split';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type TxType =
  | 'Escrow Created'
  | 'Escrow Funded'
  | 'Work Submitted'
  | 'Milestone Approved'
  | 'Funds Released'
  | 'Dispute Opened'
  | 'Dispute Resolved';

export interface OnChainTx {
  id: string;
  txHash: string;
  type: TxType;
  from: string;
  to: string;
  amountEth: number;
  status: 'Confirmed' | 'Pending';
  blockNumber: number;
  timestamp: string;
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  txHash?: string;
}
