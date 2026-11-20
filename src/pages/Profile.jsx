import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { shortenAddress } from '../lib/blockchain'
import WalletButton from '../components/WalletButton.jsx'

function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const { account } = useWallet()

  const [fullName, setFullName] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [savingWallet, setSavingWallet] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [walletSuccess, setWalletSuccess] = useState('')

  const handleSaveWallet = async () => {
    setWalletError('')
    setWalletSuccess('')

    if (!account) {
      setWalletError('Connect your wallet first using the button in the navbar.')
      return
    }

    setSavingWallet(true)
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: account })
      .eq('id', user.id)
    setSavingWallet(false)

    if (error) {
      setWalletError(error.message)
      return
    }

    await refreshProfile()
    setWalletSuccess('Wallet address saved.')
  }

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
    }
  }, [profile])

  const validate = () => {
    const newErrors = {}
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    if (!validate()) return

    setSaving(true)

    // Only full_name is sent. "role" is never editable here, and the
    // database trigger would reject a role change from the app anyway.
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setServerError(error.message)
      return
    }

    await refreshProfile()
    setSuccessMessage('Profile updated successfully.')
  }

  if (loading || !profile) {
    return (
      <div className="wt-spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="wt-page">
      <div className="card wt-card shadow-sm">
        <div className="card-body p-4">
          <h2 className="mb-4">My Profile</h2>

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
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={profile.email}
                disabled
                readOnly
              />
              <div className="form-text">Email cannot be changed here.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Account Role
              </label>
              <input
                type="text"
                id="role"
                className="form-control text-capitalize"
                value={profile.role}
                disabled
                readOnly
              />
              <div className="form-text">
                Your role is set at registration and cannot be changed from
                this page.
              </div>
            </div>

            <div className="mb-4">
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
                disabled={saving}
              />
              {errors.fullName && (
                <div className="invalid-feedback">{errors.fullName}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="card wt-card shadow-sm mt-4">
        <div className="card-body p-4">
          <h4 className="mb-3">Wallet Address</h4>
          <p className="text-muted small">
            {profile.role === 'freelancer'
              ? 'Clients pay escrow to this address, so it must be set before anyone can hire and fund you.'
              : 'Used as the sender address when you fund an escrow.'}
          </p>

          {walletError && (
            <div className="alert alert-danger" role="alert">
              {walletError}
            </div>
          )}
          {walletSuccess && (
            <div className="alert alert-success" role="alert">
              {walletSuccess}
            </div>
          )}

          <p className="mb-2">
            <strong>Saved address:</strong>{' '}
            {profile.wallet_address ? (
              <span title={profile.wallet_address}>{shortenAddress(profile.wallet_address)}</span>
            ) : (
              <span className="text-muted">Not set yet</span>
            )}
          </p>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <WalletButton />
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleSaveWallet}
              disabled={savingWallet || !account}
            >
              {savingWallet ? 'Saving...' : 'Use my connected wallet'}
            </button>
          </div>
          {account && account !== profile.wallet_address && (
            <div className="form-text">
              Connected: {shortenAddress(account)}. Click "Use my connected wallet" to save it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
