'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { api } from '@/lib/api'

interface Investment {
  id: string
  sharesOwned: number
  purchasePrice: number
  property: {
    id: string
    title: string
    pricePerShare: number
    totalShares: number
    location: string
  }
}

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth()
  const { walletAddress, linkWallet } = useWeb3()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [linkMsg, setLinkMsg] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      window.location.href = '/auth'
      return
    }
    fetchInvestments()
  }, [user, authLoading])

  const fetchInvestments = async () => {
    const res = await api.get<{ investments: Investment[] }>('/api/investments', token)
    if (res.ok && res.data) {
      setInvestments(res.data.investments)
    }
    setLoading(false)
  }

  const handleLinkWallet = async () => {
    setLinkMsg('')
    const error = await linkWallet()
    if (error) setLinkMsg('❌ ' + error)
    else setLinkMsg('✅ Wallet linked successfully!')
  }

  const totalValue = investments.reduce(
    (sum, h) => sum + h.sharesOwned * h.property.pricePerShare,
    0
  )
  const totalShares = investments.reduce((sum, h) => sum + h.sharesOwned, 0)

  if (authLoading || loading) return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a8c5a0',
      fontSize: '1.2rem'
    }}>
      Loading your portfolio...
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
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
            My Portfolio
          </div>
          <h1 style={{ color: '#f5f0e8', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
            Welcome back, {user?.name || 'Investor'}! 👋
          </h1>
          <p style={{ color: '#a8c5a0', fontSize: '1rem', margin: 0 }}>
            {user?.email}
          </p>
        </div>

        {/* Wallet section */}
        <div style={{
          backgroundColor: '#132213',
          border: '1px solid rgba(200, 169, 110, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ color: '#a8c5a0', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              🦊 Wallet
            </div>
            <div style={{ color: '#f5f0e8', fontSize: '1rem' }}>
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                : walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (not linked)`
                  : 'No wallet connected'
              }
            </div>
            {linkMsg && <div style={{ color: '#a8c5a0', fontSize: '0.8rem', marginTop: '0.3rem' }}>{linkMsg}</div>}
          </div>
          {walletAddress && !user?.walletAddress && (
            <button onClick={handleLinkWallet} style={{
              backgroundColor: '#c8a96e',
              color: '#1a2e1a',
              border: 'none',
              padding: '0.6rem 1.5rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              fontFamily: 'Georgia, serif',
            }}>
              Link Wallet
            </button>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <a href="/profile" style={{
            color: '#a8c5a0', textDecoration: 'none', fontSize: '0.85rem',
            backgroundColor: 'rgba(200, 169, 110, 0.08)', border: '1px solid rgba(200, 169, 110, 0.15)',
            padding: '0.5rem 1.2rem', borderRadius: '25px'
          }}>👤 Profile</a>
          <a href="/kyc" style={{
            color: '#a8c5a0', textDecoration: 'none', fontSize: '0.85rem',
            backgroundColor: 'rgba(200, 169, 110, 0.08)', border: '1px solid rgba(200, 169, 110, 0.15)',
            padding: '0.5rem 1.2rem', borderRadius: '25px'
          }}>🪪 KYC ({user?.kycStatus})</a>
          <a href="/marketplace/sell" style={{
            color: '#a8c5a0', textDecoration: 'none', fontSize: '0.85rem',
            backgroundColor: 'rgba(200, 169, 110, 0.08)', border: '1px solid rgba(200, 169, 110, 0.15)',
            padding: '0.5rem 1.2rem', borderRadius: '25px'
          }}>📤 Sell Shares</a>
        </div>

        {/* Summary cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          {[
            { label: 'Total Portfolio Value', value: `₹${totalValue.toLocaleString()}`, icon: '💰' },
            { label: 'Total Shares Owned', value: totalShares, icon: '📊' },
            { label: 'Land Parcels', value: investments.length, icon: '🌿' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: '#132213',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ color: '#c8a96e', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                {stat.value}
              </div>
              <div style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Holdings */}
        <h2 style={{ color: '#f5f0e8', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Your Land Holdings
        </h2>

        {investments.length === 0 ? (
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <p style={{ color: '#a8c5a0', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              You don&apos;t own any shares yet!
            </p>
            <a href="/parcels" style={{
              backgroundColor: '#c8a96e',
              color: '#1a2e1a',
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}>
              Browse Land Parcels →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {investments.map((inv) => (
              <div key={inv.id} style={{
                backgroundColor: '#132213',
                border: '1px solid rgba(200, 169, 110, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#1a3a1a',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    🌿
                  </div>
                  <div>
                    <h3 style={{ color: '#f5f0e8', margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
                      {inv.property.title}
                    </h3>
                    <p style={{ color: '#a8c5a0', margin: 0, fontSize: '0.85rem' }}>
                      {inv.sharesOwned} share{inv.sharesOwned > 1 ? 's' : ''} •{' '}
                      {((inv.sharesOwned / inv.property.totalShares) * 100).toFixed(2)}% ownership
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#c8a96e', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    ₹{(inv.sharesOwned * inv.property.pricePerShare).toLocaleString()}
                  </div>
                  <div style={{ color: '#a8c5a0', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    ₹{inv.property.pricePerShare.toLocaleString()} per share
                  </div>
                  <a href={`/parcels/${inv.property.id}`} style={{
                    color: '#c8a96e',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    marginTop: '0.3rem',
                    display: 'inline-block'
                  }}>
                    View parcel →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Browse more */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="/parcels" style={{
            backgroundColor: 'transparent',
            color: '#c8a96e',
            border: '1px solid rgba(200, 169, 110, 0.3)',
            padding: '0.8rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontSize: '0.95rem'
          }}>
            Browse More Parcels →
          </a>
        </div>

      </div>
    </main>
  )
}