export function jobStatusBadgeClass(status) {
  switch (status) {
    case 'open':
      return 'bg-success'
    case 'hired':
      return 'bg-primary'
    case 'completed':
      return 'bg-secondary'
    case 'cancelled':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export function applicationStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-warning text-dark'
    case 'accepted':
      return 'bg-success'
    case 'rejected':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export function submissionStatusBadgeClass(status) {
  switch (status) {
    case 'submitted':
      return 'bg-warning text-dark'
    case 'approved':
      return 'bg-success'
    case 'rejected':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export function disputeStatusBadgeClass(status) {
  switch (status) {
    case 'open':
      return 'bg-danger'
    case 'resolved_release':
      return 'bg-success'
    case 'resolved_refund':
      return 'bg-info text-dark'
    default:
      return 'bg-secondary'
  }
}

export function escrowStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-secondary'
    case 'funded':
      return 'bg-primary'
    case 'released':
      return 'bg-success'
    case 'refunded':
      return 'bg-info text-dark'
    case 'disputed':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export function formatCurrency(amount) {
  const value = Number(amount)
  if (Number.isNaN(value)) return '—'
  return `${value.toFixed(2)} ETH`
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
