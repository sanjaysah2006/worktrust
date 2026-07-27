// src/pages/SubmitWork.jsx
//
// Freelancer submits completed work for a funded hire.
// Route: /hires/:hireId/submit

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchHireById } from '../lib/escrowApi'
import { fetchSubmissionsForHire, createSubmission } from '../lib/submissionsApi'
import { escrowStatusBadgeClass, submissionStatusBadgeClass, formatCurrency, formatDate } from '../lib/format'

function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

function SubmitWork() {
  const { hireId } = useParams()
  const { user } = useAuth()

  const [hire, setHire] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [message, setMessage] = useState('')
  const [url, setUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    const { data: hireData, error: hireError } = await fetchHireById(hireId)

    if (hireError) {
      setLoadError(
        hireError.code === 'PGRST116'
          ? 'This hire does not exist, or you do not have access to it.'
          : hireError.message
      )
      setLoading(false)
      return
    }

    setHire(hireData)

    const { data: subsData, error: subsError } = await fetchSubmissionsForHire(hireId)
    if (subsError) {
      setLoadError(subsError.message)
      setLoading(false)
      return
    }

    setSubmissions(subsData || [])
    setLoading(false)
  }, [hireId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">{loadError}</div>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const isFreelancer = user && hire.freelancer_id === user.id

  if (!isFreelancer) {
    return (
      <div className="wt-page">
        <div className="alert alert-danger">You do not have permission to submit work for this hire.</div>
      </div>
    )
  }

  const latestSubmission = submissions[0] || null
  const escrowIsFunded = hire.escrow_status === 'funded'
  const hasPendingSubmission = latestSubmission && latestSubmission.status === 'submitted'
  const canSubmitNew = escrowIsFunded && !hasPendingSubmission

  const validate = () => {
    const errors = {}
    if (!message.trim()) {
      errors.message = 'Please describe what you completed.'
    }
    if (!url.trim()) {
      errors.url = 'Project URL is required.'
    } else if (!isValidUrl(url.trim())) {
      errors.url = 'Enter a full URL, e.g. https://example.com'
    }
    if (!githubUrl.trim()) {
      errors.githubUrl = 'GitHub URL is required.'
    } else if (!isValidUrl(githubUrl.trim())) {
      errors.githubUrl = 'Enter a full URL, e.g. https://github.com/you/repo'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!validate()) return

    setSubmitting(true)
    const { error } = await createSubmission({
      hireId: hire.id,
      freelancerId: user.id,
      message: message.trim(),
      url: url.trim(),
      githubUrl: githubUrl.trim(),
    })
    setSubmitting(false)

    if (error) {
      setSubmitError(error.message)
      return
    }

    setMessage('')
    setUrl('')
    setGithubUrl('')
    setSubmitSuccess('Work submitted. The client has been notified to review it.')
    await load()
  }

  return (
    <div className="wt-page" style={{ maxWidth: '640px' }}>
      <h2>Submit Work</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{hire.job?.title || 'Job'}</h5>
          <p className="card-text mb-1">
            <strong>Amount:</strong> {formatCurrency(hire.amount)}
          </p>
          <p className="card-text mb-0">
            <strong>Escrow status:</strong>{' '}
            <span className={`badge ${escrowStatusBadgeClass(hire.escrow_status)} text-capitalize`}>
              {hire.escrow_status}
            </span>
          </p>
        </div>
      </div>

      {!escrowIsFunded && (
        <div className="alert alert-secondary">
          {hire.escrow_status === 'pending' &&
            'The client has not funded the escrow yet. You can submit work once it is funded.'}
          {hire.escrow_status === 'disputed' && 'This hire is under dispute. Wait for an administrator to resolve it.'}
          {(hire.escrow_status === 'released' || hire.escrow_status === 'refunded') &&
            'This hire is already closed, so new submissions are no longer accepted.'}
        </div>
      )}

      {escrowIsFunded && hasPendingSubmission && (
        <div className="alert alert-info">Your latest submission is awaiting the client's review.</div>
      )}

      {submitError && <div className="alert alert-danger">{submitError}</div>}
      {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

      {canSubmitNew && (
        <form onSubmit={handleSubmit} noValidate className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                Message to Client
              </label>
              <textarea
                id="message"
                rows="4"
                className={`form-control ${formErrors.message ? 'is-invalid' : ''}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
              />
              {formErrors.message && <div className="invalid-feedback">{formErrors.message}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="url" className="form-label">
                Project URL
              </label>
              <input
                type="url"
                id="url"
                className={`form-control ${formErrors.url ? 'is-invalid' : ''}`}
                placeholder="https://your-deployed-project.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={submitting}
              />
              {formErrors.url && <div className="invalid-feedback">{formErrors.url}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="githubUrl" className="form-label">
                GitHub URL
              </label>
              <input
                type="url"
                id="githubUrl"
                className={`form-control ${formErrors.githubUrl ? 'is-invalid' : ''}`}
                placeholder="https://github.com/you/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={submitting}
              />
              {formErrors.githubUrl && <div className="invalid-feedback">{formErrors.githubUrl}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Work'
              )}
            </button>
          </div>
        </form>
      )}

      {submissions.length > 0 && (
        <div>
          <h5>Submission History</h5>
          {submissions.map((sub) => (
            <div className="card shadow-sm mb-3" key={sub.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <span className={`badge ${submissionStatusBadgeClass(sub.status)} text-capitalize`}>
                    {sub.status}
                  </span>
                  <span className="text-muted small">{formatDate(sub.created_at)}</span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{sub.message}</p>
                <p className="mb-1">
                  <strong>Project:</strong>{' '}
                  <a href={sub.url} target="_blank" rel="noopener noreferrer">
                    {sub.url}
                  </a>
                </p>
                <p className="mb-0">
                  <strong>GitHub:</strong>{' '}
                  <a href={sub.github_url} target="_blank" rel="noopener noreferrer">
                    {sub.github_url}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubmitWork
