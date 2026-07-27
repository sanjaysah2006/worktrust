import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="wt-page text-center py-5">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-3 text-primary"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <h1 className="display-4 fw-bold mb-2">404</h1>
      <p className="lead text-muted mb-4">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Go back home
      </Link>
    </div>
  )
}

export default NotFound
