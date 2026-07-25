import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { WalletModal } from './components/common/WalletModal';
import { LandingPage } from './components/landing/LandingPage';
import { JobsMarketplace } from './components/jobs/JobsMarketplace';
import { JobDetailModal } from './components/jobs/JobDetailModal';
import { PostJobPage } from './components/jobs/PostJobPage';
import { ClientDashboard } from './components/dashboards/ClientDashboard';
import { FreelancerDashboard } from './components/dashboards/FreelancerDashboard';
import { ProposalsReviewModal } from './components/proposals/ProposalsReviewModal';
import { ContractWorkspace } from './components/contracts/ContractWorkspace';
import { FundEscrowModal } from './components/contracts/FundEscrowModal';
import { SubmitWorkModal } from './components/contracts/SubmitWorkModal';
import { RaiseDisputeModal } from './components/disputes/RaiseDisputeModal';
import { AdminDisputeCenter } from './components/disputes/AdminDisputeCenter';
import { SettingsPage } from './components/settings/SettingsPage';
import { TransactionLedger } from './components/transactions/TransactionLedger';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'jobs' && <JobsMarketplace />}
      {currentView === 'job-detail' && <JobDetailModal />}
      {currentView === 'post-job' && <PostJobPage />}
      {currentView === 'client-dashboard' && <ClientDashboard />}
      {currentView === 'freelancer-dashboard' && <FreelancerDashboard />}
      {currentView === 'contract-workspace' && <ContractWorkspace />}
      {currentView === 'admin-disputes' && <AdminDisputeCenter />}
      {currentView === 'settings' && <SettingsPage />}
      {currentView === 'transactions' && <TransactionLedger />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased">
        <Header />
        <MainContent />
        <Footer />

        {/* Global Modals & Overlays */}
        <WalletModal />
        <ProposalsReviewModal />
        <FundEscrowModal />
        <SubmitWorkModal />
        <RaiseDisputeModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
