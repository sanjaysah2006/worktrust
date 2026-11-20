import { useEffect, useState } from 'react'
import JobCard from '../components/JobCard.jsx'
import Skeleton from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchOpenJobs } from '../lib/jobsApi'

function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await fetchOpenJobs()

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
  }, [])

  return (
    <div className="wt-page">
      <div className="wt-page-header">
        <h2>Browse Open Jobs</h2>
      </div>

      {loading && <Skeleton variant="cards" count={4} />}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          Could not load jobs: {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon="search"
          title="No open jobs right now"
          message="There are no open jobs at the moment. Check back later for new listings."
        />
      )}

      {!loading &&
        !error &&
        jobs.map((job) => <JobCard key={job.id} job={job} />)}
    </div>
  )
}

export default BrowseJobs
