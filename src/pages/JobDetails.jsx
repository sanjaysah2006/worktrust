import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchJobById,
  fetchMyApplicationForJob,
  createApplication,
} from '../lib/jobsApi'
import {
  jobStatusBadgeClass,
  applicationStatusBadgeClass,
  formatCurrency,
  formatDate,
} from '../lib/format'

function JobDetails() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [myApplication, setMyApplication] = useState(null)
  const [checkingApplication, setCheckingApplication] = useState(false)

  const [coverLetter, setCoverLetter] = useState('')
  const [proposedAmount, setProposedAmount] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState('')

  const loadJob = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await fetchJobById(id)

    if (fetchError) {
      setError(
        fetchError.code === 'PGRST116'
          ? 'This job does not exist or has been removed.'
          : fetchError.message
      )
      setJob(null)
    } else {
      setJob(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadJob()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const checkApplication = async () => {
      if (!user || !profile || profile.role !== 'freelancer') return

      setCheckingApplication(true)
      const { data } = await fetchMyApplicationForJob(id, user.id)
      setMyApplication(data || null)
      setCheckingApplication(false)
    }

    checkApplication()
  }, [id, user, profile])

  const validateApplication = () => {
    const newErrors = {}
    if (!coverLetter.trim()) {
      newErrors.coverLetter = 'Please write a short cover letter.'
    }
    const amount = Number(proposedAmount)
    if (!proposedAmount) {
      newErrors.proposedAmount = 'Proposed amount is required.'
    } else if (Number.isNaN(amount) || amount <= 0) {
      newErrors.proposedAmount = 'Enter a valid amount greater than 0.'
    }
    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplyError('')
    setApplySuccess('')

    if (!validateApplication()) return

    setApplying(true)
    const { data, error: applyErr } = await createApplication({
      jobId: id,
      freelancerId: user.id,
      coverLetter: coverLetter.trim(),
      proposedAmount: Number(proposedAmount),
    })
    setApplying(false)

    if (applyErr) {
      setApplyError(applyErr.message)
      return
    }

    setMyApplication(data)
    setApplySuccess('Your application has been submitted.')
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
        <Link to="/jobs" className="btn btn-outline-secondary btn-sm">
          Back to Browse Jobs
        </Link>
      </div>
    )
  }

  if (!job) return null

  const isOwner = user && job.client_id === user.id
  const isFreelancer = profile?.role === 'freelancer'

  return (
    <div className="wt-page">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h2 className="mb-1">{job.title}</h2>
            <span
              className={`badge ${jobStatusBadgeClass(job.status)} text-capitalize fs-6`}
            >
              {job.status}
            </span>
          </div>

          {job.client?.full_name && (
            <p className="text-muted mb-3">Posted by {job.client.full_name}</p>
          )}

          <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>

          <div className="row mt-4">
            <div className="col-sm-6">
              <strong>Budget:</strong> {formatCurrency(job.budget)}
            </div>
            <div className="col-sm-6">
              <strong>Posted:</strong> {formatDate(job.created_at)}
            </div>
          </div>

          {isOwner && (
            <div className="mt-4 d-flex gap-2 flex-wrap">
              {job.status === 'open' && (
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Edit Job
                </Link>
              )}
              <Link
                to={`/jobs/${job.id}/applications`}
                className="btn btn-primary btn-sm"
              >
                View Applications
              </Link>
            </div>
          )}
        </div>
      </div>

      {isFreelancer && !isOwner && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h4 className="mb-3">Apply for this job</h4>

            {checkingApplication && (
              <div className="wt-spinner-wrap py-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!checkingApplication && myApplication && (
              <div className="alert alert-info mb-0">
                You already applied to this job. Status:{' '}
                <span
                  className={`badge ${applicationStatusBadgeClass(myApplication.status)} text-capitalize`}
                >
                  {myApplication.status}
                </span>
              </div>
            )}

            {!checkingApplication &&
              !myApplication &&
              job.status !== 'open' && (
                <div className="alert alert-secondary mb-0">
                  This job is no longer accepting applications.
                </div>
              )}

            {!checkingApplication &&
              !myApplication &&
              job.status === 'open' && (
                <form onSubmit={handleApply} noValidate>
                  {applyError && (
                    <div className="alert alert-danger">{applyError}</div>
                  )}
                  {applySuccess && (
                    <div className="alert alert-success">{applySuccess}</div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="coverLetter" className="form-label">
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      className={`form-control ${
                        formErrors.coverLetter ? 'is-invalid' : ''
                      }`}
                      rows="4"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      disabled={applying}
                    />
                    {formErrors.coverLetter && (
                      <div className="invalid-feedback">
                        {formErrors.coverLetter}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="proposedAmount" className="form-label">
                      Proposed Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      id="proposedAmount"
                      className={`form-control ${
                        formErrors.proposedAmount ? 'is-invalid' : ''
                      }`}
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      disabled={applying}
                    />
                    {formErrors.proposedAmount && (
                      <div className="invalid-feedback">
                        {formErrors.proposedAmount}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn-link mt-3 ps-0"
        onClick={() => navigate('/jobs')}
      >
        &larr; Back to Browse Jobs
      </button>
    </div>
  )
}

export default JobDetails
