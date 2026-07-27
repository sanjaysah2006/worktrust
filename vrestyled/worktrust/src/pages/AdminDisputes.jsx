// src/pages/AdminDisputes.jsx
//
// Administrator's list of open (unresolved) disputes.
// Route: /admin/disputes

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOpenDisputes } from '../lib/disputesApi'
import { formatCurrency, formatDate } from '../lib/format'
import Skeleton from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

function AdminDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await fetchOpenDisputes()

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setDisputes(data || [])
      }
      setLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="wt-page">
      <div className="wt-page-header">
        <h2>Open Disputes</h2>
      </div>

      {loading && <Skeleton variant="cards" count={3} />}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          Could not load disputes: {error}
        </div>
      )}

      {!loading && !error && disputes.length === 0 && (
        <EmptyState
          icon="check"
          title="No open disputes"
          message="There are no open disputes right now. New disputes will appear here as they're raised."
        />
      )}

      {!loading &&
        !error &&
        disputes.map((dispute) => (
          <div className="card shadow-sm mb-3" key={dispute.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <h5 className="mb-1">{dispute.hire?.job?.title || 'Job'}</h5>
                <span className="badge bg-danger text-capitalize">{dispute.status}</span>
              </div>

              <p className="text-muted small mb-2">
                Raised by {dispute.raiser?.full_name || 'Unknown'} ({dispute.raiser?.role}) on{' '}
                {formatDate(dispute.created_at)}
              </p>

              <p className="text-truncate-3">{dispute.reason}</p>

              <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                <span>
                  <strong>Client:</strong> {dispute.hire?.client?.full_name}
                </span>
                <span>
                  <strong>Freelancer:</strong> {dispute.hire?.freelancer?.full_name}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-semibold">{formatCurrency(dispute.hire?.amount)}</span>
                <Link to={`/admin/disputes/${dispute.id}`} className="btn btn-primary btn-sm">
                  Review Dispute
                </Link>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default AdminDisputes
