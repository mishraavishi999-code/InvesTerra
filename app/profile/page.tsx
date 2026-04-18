'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user, token, loading: authLoading, refreshUser } = useAuth()
  const { walletAddress, linkWallet } = useWeb3()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/auth'; return }
    setName(user.name || '')
    setPhone((user as unknown as { phone?: string }).phone || '')
  }, [user, authLoading])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const res = await api.put('/api/users/profile', { name, phone }, token)
    if (res.ok) {
      setMessage('✅ Profile updated!')
      await refreshUser()
    } else {
      setMessage('❌ ' + (res.error || 'Failed to update'))
    }
    setSaving(false)
  }

  const handleLinkWallet = async () => {
    setMessage('')
    const error = await linkWallet()
    if (error) setMessage('❌ ' + error)
    else setMessage('✅ Wallet linked successfully!')
  }

  if (authLoading || !user) return (
    <main style={{
      minHeight: '100vh', backgroundColor: '#0f1e0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#a8c5a0', fontSize: '1.2rem'
    }}>
      Loading...
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(200, 169, 110, 0.15)',
          border: '1px solid rgba(200, 169, 110, 0.3)',
          color: '#c8a96e',
          padding: '0.4rem 1.2rem',
          borderRadius: '25px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Profile
        </div>

        <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: '0 0 2rem 0' }}>
          Account Settings
        </h1>

        <div style={{
          backgroundColor: '#132213',
          border: '1px solid rgba(200, 169, 110, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#f5f0e8', margin: '0 0 1.5rem 0' }}>Personal Info</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
            <input value={user.email} disabled style={{
              width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
              border: '1px solid rgba(200, 169, 110, 0.1)', backgroundColor: '#0a150a',
              color: '#666', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
            }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{
              width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
              border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
              color: '#f5f0e8', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
            }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={{
              width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
              border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
              color: '#f5f0e8', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
            }} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            backgroundColor: '#c8a96e', color: '#1a2e1a', border: 'none',
            padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
            fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Wallet section */}
        <div style={{
          backgroundColor: '#132213',
          border: '1px solid rgba(200, 169, 110, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#f5f0e8', margin: '0 0 1rem 0' }}>🦊 Wallet</h3>
          {user.walletAddress ? (
            <div>
              <div style={{ color: '#a8c5a0', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Linked wallet</div>
              <div style={{ color: '#c8a96e', fontSize: '1rem', fontFamily: 'monospace' }}>
                {user.walletAddress}
              </div>
            </div>
          ) : walletAddress ? (
            <div>
              <div style={{ color: '#a8c5a0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Connected wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button onClick={handleLinkWallet} style={{
                backgroundColor: '#c8a96e', color: '#1a2e1a', border: 'none',
                padding: '0.6rem 1.5rem', borderRadius: '25px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.85rem', fontFamily: 'Georgia, serif',
              }}>
                Link This Wallet
              </button>
            </div>
          ) : (
            <div style={{ color: '#a8c5a0', fontSize: '0.95rem' }}>
              Connect MetaMask from the navbar to link a wallet.
            </div>
          )}
        </div>

        {/* KYC status */}
        <div style={{
          backgroundColor: '#132213',
          border: '1px solid rgba(200, 169, 110, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          <h3 style={{ color: '#f5f0e8', margin: '0 0 1rem 0' }}>🪪 KYC Status</h3>
          <div style={{
            display: 'inline-block',
            backgroundColor: user.kycStatus === 'APPROVED'
              ? 'rgba(74, 222, 128, 0.15)'
              : user.kycStatus === 'PENDING'
                ? 'rgba(250, 204, 21, 0.15)'
                : 'rgba(200, 169, 110, 0.1)',
            color: user.kycStatus === 'APPROVED' ? '#4ade80' : user.kycStatus === 'PENDING' ? '#facc15' : '#a8c5a0',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {user.kycStatus}
          </div>
          {user.kycStatus !== 'APPROVED' && (
            <div>
              <a href="/kyc" style={{
                color: '#c8a96e', textDecoration: 'none', fontSize: '0.9rem'
              }}>
                Complete KYC →
              </a>
            </div>
          )}
        </div>

        {message && (
          <p style={{ color: message.startsWith('❌') ? '#ef4444' : '#4ade80', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
