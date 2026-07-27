import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createJob, updateJob, closeJob, fetchJobById } from '../lib/jobsApi'

function CreateJob() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [errors, setErrors] = useState({})

  const [loadingJob, setLoadingJob] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [job, setJob] = useState(null)

  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    const load = async () => {
      setLoadingJob(true)
      setLoadError('')
      const { data, error } = await fetchJobById(id)

      if (error) {
        setLoadError(
          error.code === 'PGRST116'
            ? 'This job does not exist.'
            : error.message
        )
        setLoadingJob(false)
        return
      }

      if (data.client_id !== user.id) {
        setLoadError('You do not have permission to edit this job.')
        setLoadingJob(false)
        return
      }

      setJob(data)
      setTitle(data.title)
      setDescription(data.description)
      setBudget(String(data.budget))
      setLoadingJob(false)
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode])

  const validate = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Job title is required.'
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required.'
    }

    const budgetValue = Number(budget)
    if (!budget) {
      newErrors.budget = 'Budget is required.'
    } else if (Number.isNaN(budgetValue) || budgetValue <= 0) {
      newErrors.budget = 'Enter a valid budget greater than 0.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    setSaving(true)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
    }

    const { data, error } = isEditMode
      ? await updateJob(id, payload)
      : await createJob({ clientId: user.id, ...payload })

    setSaving(false)

    if (error) {
      setServerError(error.message)
      return
    }

    navigate(`/jobs/${data.id}`)
  }

  const handleClose = async () => {
    const confirmed = window.confirm(
      'Close this job? It will no longer accept applications. This cannot be undone.'
    )
    if (!confirmed) return

    setClosing(true)
    setServerError('')
    const { error } = await closeJob(id)
    setClosing(false)

    if (error) {
      setServerError(error.message)
      return
    }

    navigate('/dashboard')
  }

  if (loadingJob) {
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
      </div>
    )
  }

  if (isEditMode && job && job.status !== 'open') {
    return (
      <div className="wt-page">
        <div className="alert alert-secondary">
          This job can no longer be edited because its status is "
          {job.status}".
        </div>
      </div>
    )
  }

  return (
    <div className="wt-page">
      <div className="card wt-card shadow-sm" style={{ maxWidth: '640px' }}>
        <div className="card-body p-4">
          <h2 className="mb-4">{isEditMode ? 'Edit Job' : 'Post a New Job'}</h2>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving || closing}
              />
              {errors.title && (
                <div className="invalid-feedback">{errors.title}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                rows="6"
                className={`form-control ${
                  errors.description ? 'is-invalid' : ''
                }`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving || closing}
              />
              {errors.description && (
                <div className="invalid-feedback">{errors.description}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="budget" className="form-label">
                Budget (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                id="budget"
                className={`form-control ${errors.budget ? 'is-invalid' : ''}`}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={saving || closing}
              />
              {errors.budget && (
                <div className="invalid-feedback">{errors.budget}</div>
              )}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || closing}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Post Job'
                )}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleClose}
                  disabled={saving || closing}
                >
                  {closing ? 'Closing...' : 'Close Job'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateJob
