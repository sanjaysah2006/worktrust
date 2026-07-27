import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('client')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    if (role !== 'client' && role !== 'freelancer') {
      newErrors.role = 'Select a valid role.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    if (!validate()) return

    setLoading(true)

    // Administrators are never created through public registration.
    // Only "client" and "freelancer" are allowed here.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    })

    setLoading(false)

    if (error) {
      setServerError(error.message)
      return
    }

    // If Supabase has "Confirm email" turned on, there will be no active
    // session yet and the user must verify their email before logging in.
    if (data.session) {
      navigate('/dashboard')
    } else {
      setSuccessMessage(
        'Registration successful. Please check your email to confirm your account before logging in.'
      )
    }
  }

  return (
    <div className="wt-page">
      <div className="card wt-card shadow-sm">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Create an Account</h2>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className={`form-control ${
                  errors.fullName ? 'is-invalid' : ''
                }`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              {errors.fullName && (
                <div className="invalid-feedback">{errors.fullName}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`form-control ${
                  errors.password ? 'is-invalid' : ''
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword ? 'is-invalid' : ''
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label d-block">I am registering as</label>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleClient"
                  value="client"
                  checked={role === 'client'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="roleClient">
                  Client
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleFreelancer"
                  value="freelancer"
                  checked={role === 'freelancer'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="roleFreelancer">
                  Freelancer
                </label>
              </div>

              {errors.role && (
                <div className="text-danger small mt-1">{errors.role}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
