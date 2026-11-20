import { Link } from 'react-router-dom'

const STEPS = [
  {
    title: 'Post or Apply',
    text: 'Clients post jobs. Freelancers browse open jobs and submit applications.',
    icon: (
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    ),
  },
  {
    title: 'Escrow Funding',
    text: 'The client hires a freelancer and funds a smart contract escrow with Sepolia test ETH.',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M16 3.5 12 7 8 3.5" />
      </>
    ),
  },
  {
    title: 'Secure Release',
    text: 'Once work is approved, the contract releases funds. Disputes can be resolved by an administrator.',
    icon: (
      <>
        <path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
]

function Home() {
  return (
    <div className="wt-page">
      <div className="text-center py-5">
        <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2">
          Secured by Ethereum smart contracts
        </span>
        <h1 className="display-5 fw-bold">Welcome to WorkTrust</h1>
        <p className="lead mt-3 mx-auto" style={{ maxWidth: '640px' }}>
          A trustless freelance marketplace where payments are secured by an
          Ethereum smart contract escrow instead of a middleman.
        </p>
        <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline-secondary btn-lg">
            Login
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-4">
        {STEPS.map((step, i) => (
          <div className="col-md-4" key={step.title}>
            <div className="card h-100 wt-static-card wt-hover-lift">
              <div className="card-body">
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: 'var(--wt-radius)',
                    backgroundColor: 'var(--wt-primary-light)',
                    color: 'var(--wt-primary)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {step.icon}
                  </svg>
                </div>
                <h6 className="text-uppercase text-primary mb-1" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                  Step {i + 1}
                </h6>
                <h5 className="card-title">{step.title}</h5>
                <p className="card-text text-muted">{step.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
