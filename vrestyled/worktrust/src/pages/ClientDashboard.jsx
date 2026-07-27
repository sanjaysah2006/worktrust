import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import JobCard from '../components/JobCard.jsx'
import Skeleton from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchJobsByClient } from '../lib/jobsApi'

function ClientDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await fetchJobsByClient(user.id)

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setJobs(data || [])
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
        <h2>My Posted Jobs</h2>
        <Link to="/jobs/new" className="btn btn-primary">
          Post a New Job
        </Link>
      </div>

      {loading && <Skeleton variant="cards" count={3} />}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          Could not load your jobs: {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No jobs posted yet"
          message="You haven't posted any jobs yet. Post your first job to start hiring freelancers."
          action={
            <Link to="/jobs/new" className="btn btn-primary btn-sm">
              Post your first job
            </Link>
          }
        />
      )}

      {!loading &&
        !error &&
        jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            actions={
              <>
                {job.status === 'open' && (
                  <Link
                    to={`/jobs/${job.id}/edit`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Edit
                  </Link>
                )}
                <Link
                  to={`/jobs/${job.id}/applications`}
                  className="btn btn-outline-primary btn-sm"
                >
                  View Applications
                </Link>
              </>
            }
          />
        ))}
    </div>
  )
}

export default ClientDashboard
