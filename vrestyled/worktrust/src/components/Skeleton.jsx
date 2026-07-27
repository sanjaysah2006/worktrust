// src/components/Skeleton.jsx
//
// Lightweight shimmering placeholder used while a page's data is loading.
// Pure presentation, no data fetching — pages control when it's shown.
//
//   <Skeleton variant="cards" count={3} />   // job/dispute/application lists
//   <Skeleton variant="table" rows={5} />    // table-based pages
//   <Skeleton variant="lines" count={3} />   // generic text block

function SkeletonCard() {
  return (
    <div className="card shadow-sm mb-3 wt-static-card" aria-hidden="true">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div className="wt-skeleton" style={{ height: '1.1rem', width: '55%' }} />
          <div className="wt-skeleton" style={{ height: '1.4rem', width: '4.5rem', borderRadius: '999px' }} />
        </div>
        <div className="wt-skeleton mb-2" style={{ height: '0.8rem', width: '90%' }} />
        <div className="wt-skeleton mb-2" style={{ height: '0.8rem', width: '75%' }} />
        <div className="d-flex justify-content-between mt-3">
          <div className="wt-skeleton" style={{ height: '0.9rem', width: '5rem' }} />
          <div className="wt-skeleton" style={{ height: '0.9rem', width: '6rem' }} />
        </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr aria-hidden="true">
      <td colSpan={100}>
        <div className="wt-skeleton" style={{ height: '1rem', width: '100%' }} />
      </td>
    </tr>
  )
}

function SkeletonLine({ width }) {
  return <div className="wt-skeleton mb-2" style={{ height: '0.85rem', width }} aria-hidden="true" />
}

function Skeleton({ variant = 'cards', count = 3, rows = 4 }) {
  if (variant === 'table') {
    return (
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </>
    )
  }

  if (variant === 'lines') {
    const widths = ['100%', '85%', '70%']
    return (
      <div role="status" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonLine key={i} width={widths[i % widths.length]} />
        ))}
      </div>
    )
  }

  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default Skeleton
