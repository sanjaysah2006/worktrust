import { Link } from 'react-router-dom'
import { jobStatusBadgeClass, formatCurrency, formatDate } from '../lib/format'

/**
 * Displays a single job summary.
 * Pass `actions` (a React node, e.g. buttons/links) to render extra
 * controls under the card — used by ClientDashboard for "Edit" etc.
 */
function JobCard({ job, actions }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <h5 className="card-title mb-1">{job.title}</h5>
          <span className={`badge ${jobStatusBadgeClass(job.status)} text-capitalize`}>
            {job.status}
          </span>
        </div>

        {job.client?.full_name && (
          <p className="text-muted small mb-2">
            Posted by {job.client.full_name}
          </p>
        )}

        <p className="card-text text-truncate-3">{job.description}</p>

        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <span className="fw-semibold">{formatCurrency(job.budget)}</span>
          <span className="text-muted small">
            Posted {formatDate(job.created_at)}
          </span>
        </div>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
          {actions}
        </div>
      </div>
    </div>
  )
}

export default JobCard
