import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Wrap any route element with this component to require login.
 * Optionally pass allowedRoles={['admin']} (or any combination of
 * 'client' | 'freelancer' | 'admin') to also restrict by role.
 *
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminPage />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span>Loading your account…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Profile is still being fetched right after login — wait for it
  // before making a role decision.
  if (!profile) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span>Loading your account…</span>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="wt-page">
        <div className="wt-empty-state">
          <div
            className="wt-empty-icon text-danger"
            style={{ backgroundColor: 'var(--wt-danger-light)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h5>Access denied</h5>
          <p>
            Your account role ("{profile.role}") is not allowed to view this
            page.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
