import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import BrowseJobs from './pages/BrowseJobs.jsx'
import JobDetails from './pages/JobDetails.jsx'
import CreateJob from './pages/CreateJob.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import FreelancerDashboard from './pages/FreelancerDashboard.jsx'
import JobApplications from './pages/JobApplications.jsx'
import EscrowFunding from './pages/EscrowFunding.jsx'
import ContractDetails from './pages/ContractDetails.jsx'
import SubmitWork from './pages/SubmitWork.jsx'
import ReviewSubmission from './pages/ReviewSubmission.jsx'
import RaiseDispute from './pages/RaiseDispute.jsx'
import AdminDisputes from './pages/AdminDisputes.jsx'
import AdminDisputeDetails from './pages/AdminDisputeDetails.jsx'
import TransactionHistory from './pages/TransactionHistory.jsx'
import NotFound from './pages/NotFound.jsx'
import { useAuth } from './context/AuthContext.jsx'

// Picks the right dashboard for the logged-in user's role.
function Dashboard() {
  const { profile } = useAuth()

  if (profile?.role === 'client') return <ClientDashboard />
  if (profile?.role === 'freelancer') return <FreelancerDashboard />

  return (
    <div className="wt-page">
      <div className="alert alert-success">
        You are logged in as an <strong>administrator</strong>.
      </div>
      <div className="card shadow-sm" style={{ maxWidth: '480px' }}>
        <div className="card-body">
          <h5 className="card-title">Dispute Resolution</h5>
          <p className="card-text text-muted">
            Review open disputes and release or refund escrowed funds.
          </p>
          <Link to="/admin/disputes" className="btn btn-primary btn-sm">
            View Open Disputes
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applications"
          element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <JobApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hires/:hireId/fund"
          element={
            // No allowedRoles here: EscrowFunding itself checks whether
            // the logged-in user is the client, the freelancer, or an
            // admin on this specific hire, and shows a read-only view
            // for anyone who isn't the client.
            <ProtectedRoute>
              <EscrowFunding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contract"
          element={
            <ProtectedRoute>
              <ContractDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hires/:hireId/submit"
          element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <SubmitWork />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hires/:hireId/review"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ReviewSubmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hires/:hireId/dispute"
          element={
            <ProtectedRoute allowedRoles={['client', 'freelancer']}>
              <RaiseDispute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes/:disputeId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
