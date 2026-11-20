import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import WalletButton from './WalletButton.jsx'

function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          WorkTrust
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {!loading && !user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-primary btn-sm ms-lg-2 mt-2 mt-lg-0"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {!loading && user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/jobs">
                    Browse Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contract">
                    Contract
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/transactions">
                    Transactions
                  </Link>
                </li>
                {profile?.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/disputes">
                      Disputes
                    </Link>
                  </li>
                )}
                <li className="nav-item d-flex align-items-center">
                  <span className="badge bg-secondary me-2 text-capitalize">
                    {profile ? profile.role : 'user'}
                  </span>
                  <span className="text-light small me-3">
                    {profile ? profile.full_name || profile.email : user.email}
                  </span>
                </li>
                <li className="nav-item me-lg-2 mb-2 mb-lg-0">
                  <WalletButton />
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm mt-2 mt-lg-0"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
