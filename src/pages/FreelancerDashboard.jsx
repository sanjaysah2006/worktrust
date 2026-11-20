import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Skeleton from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchApplicationsByFreelancer } from '../lib/jobsApi'
import {
  applicationStatusBadgeClass,
  jobStatusBadgeClass,
  escrowStatusBadgeClass,
  formatCurrency,
  formatDate,
} from '../lib/format'

function FreelancerDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await fetchApplicationsByFreelancer(
        user.id
      )

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setApplications(data || [])
      }
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [user.id])

  return (
    <div className="wt-page">
      <div className="wt-page-header">
        <h2>My Applications</h2>
        <Link to="/jobs" className="btn btn-primary">
          Browse Jobs
        </Link>
      </div>

      {loading && <Skeleton variant="cards" count={3} />}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          Could not load your applications: {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <EmptyState
          icon="search"
          title="No applications yet"
          message="You haven't applied to any jobs yet. Browse open jobs to find your next project."
          action={
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Browse open jobs
            </Link>
          }
        />
      )}

      {!loading &&
        !error &&
        applications.map((app) => (
          <div className="card shadow-sm mb-3" key={app.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <h5 className="mb-1">
                  {app.job?.title || 'Job no longer available'}
                </h5>
                <span
                  className={`badge ${applicationStatusBadgeClass(app.status)} text-capitalize`}
                >
                  {app.status}
                </span>
              </div>

              {app.job && (
                <span
                  className={`badge ${jobStatusBadgeClass(app.job.status)} text-capitalize me-2`}
                >
                  Job: {app.job.status}
                </span>
              )}

              <div className="d-flex justify-content-between flex-wrap gap-2 mt-2">
                <span>
                  <strong>You proposed:</strong>{' '}
                  {formatCurrency(app.proposed_amount)}
                </span>
                <span className="text-muted small">
                  Applied {formatDate(app.created_at)}
                </span>
              </div>

              {app.hire && (
                <div className="mt-2">
                  <span className="me-2">Escrow:</span>
                  <span className={`badge ${escrowStatusBadgeClass(app.hire.escrow_status)} text-capitalize`}>
                    {app.hire.escrow_status}
                  </span>
                </div>
              )}

              <div className="d-flex gap-2 flex-wrap mt-3">
                {app.job && (
                  <Link to={`/jobs/${app.job.id}`} className="btn btn-outline-primary btn-sm">
                    View Job
                  </Link>
                )}
                {app.hire && (
                  <Link to={`/hires/${app.hire.id}/fund`} className="btn btn-outline-secondary btn-sm">
                    View Escrow
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default FreelancerDashboard
