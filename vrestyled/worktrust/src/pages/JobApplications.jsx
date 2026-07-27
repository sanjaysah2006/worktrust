import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchJobById,
  fetchApplicationsForJob,
  rejectApplication,
  hireFreelancer,
} from '../lib/jobsApi'
import {
  applicationStatusBadgeClass,
  jobStatusBadgeClass,
  escrowStatusBadgeClass,
  formatCurrency,
  formatDate,
} from '../lib/format'
import EmptyState from '../components/EmptyState.jsx'

function JobApplications() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')

    const { data: jobData, error: jobError } = await fetchJobById(id)

    if (jobError) {
      setError(
        jobError.code === 'PGRST116'
          ? 'This job does not exist.'
          : jobError.message
      )
      setLoading(false)
      return
    }

    const isOwner = jobData.client_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      setError('You do not have permission to view these applications.')
      setLoading(false)
      return
    }

    setJob(jobData)

    const { data: appsData, error: appsError } = await fetchApplicationsForJob(id)

    if (appsError) {
      setError(appsError.message)
      setLoading(false)
      return
    }

    setApplications(appsData || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleReject = async (applicationId) => {
    setActionError('')
    setBusyId(applicationId)

    const { error } = await rejectApplication(applicationId)

    setBusyId(null)

    if (error) {
      setActionError(error.message)
      return
    }

    await load()
  }

  const handleHire = async (application) => {
    const confirmed = window.confirm(
      `Hire ${application.freelancer?.full_name || 'this freelancer'} for ${formatCurrency(
        application.proposed_amount
      )}? This cannot be undone and will reject all other applicants.`
    )
    if (!confirmed) return

    setActionError('')
    setBusyId(application.id)

    const { data: hire, error } = await hireFreelancer({
      jobId: id,
      applicationId: application.id,
      clientId: user.id,
      freelancerId: application.freelancer_id,
      amount: application.proposed_amount,
    })

    setBusyId(null)

    if (error) {
      setActionError(error.message)
      await load()
      return
    }

    // Send the client straight to funding the escrow for this new hire.
    navigate(`/hires/${hire.id}/fund`)
  }

  if (loading) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">{error}</div>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const jobIsOpen = job.status === 'open'

  return (
    <div className="wt-page">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Applications for "{job.title}"</h2>
          <span className={`badge ${jobStatusBadgeClass(job.status)} text-capitalize`}>
            {job.status}
          </span>
        </div>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline-secondary btn-sm">
          View Job
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-danger" role="alert">
          {actionError}
        </div>
      )}

      {!jobIsOpen && (
        <div className="alert alert-info">
          This job is no longer open, so applications can't be rejected or
          hired anymore.
        </div>
      )}

      {job.hire && (
        <div className="alert alert-secondary d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>
            Escrow status:{' '}
            <span className={`badge ${escrowStatusBadgeClass(job.hire.escrow_status)} text-capitalize`}>
              {job.hire.escrow_status}
            </span>
          </span>
          <Link to={`/hires/${job.hire.id}/fund`} className="btn btn-outline-primary btn-sm">
            {job.hire.escrow_status === 'pending' ? 'Fund Escrow' : 'View Escrow'}
          </Link>
        </div>
      )}

      {applications.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No applications yet"
          message="No applications have been received for this job yet. Check back once freelancers start applying."
        />
      )}

      {applications.map((app) => (
        <div className="card shadow-sm mb-3" key={app.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h5 className="mb-1">
                  {app.freelancer?.full_name || 'Unknown Freelancer'}
                </h5>
                <p className="text-muted small mb-2">{app.freelancer?.email}</p>
              </div>
              <span
                className={`badge ${applicationStatusBadgeClass(app.status)} text-capitalize`}
              >
                {app.status}
              </span>
            </div>

            <p style={{ whiteSpace: 'pre-wrap' }}>{app.cover_letter}</p>

            <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <span>
                <strong>Proposed:</strong> {formatCurrency(app.proposed_amount)}
              </span>
              <span className="text-muted small">
                Applied {formatDate(app.created_at)}
              </span>
            </div>

            {jobIsOpen && app.status === 'pending' && (
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  disabled={busyId === app.id}
                  onClick={() => handleHire(app)}
                >
                  {busyId === app.id ? 'Working...' : 'Hire'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={busyId === app.id}
                  onClick={() => handleReject(app.id)}
                >
                  {busyId === app.id ? 'Working...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default JobApplications
