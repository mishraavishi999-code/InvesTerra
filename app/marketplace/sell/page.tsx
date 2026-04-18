'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface Investment {
  id: string
  sharesOwned: number
  property: {
    id: string
    title: string
    location: string
    pricePerShare: number
  }
}

export default function SellSharesPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [shares, setShares] = useState(1)
  const [askPrice, setAskPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/auth'; return }
    fetchInvestments()
  }, [user, authLoading])

  const fetchInvestments = async () => {
    const res = await api.get<{ investments: Investment[] }>('/api/investments', token)
    if (res.ok && res.data) {
      setInvestments(res.data.investments.filter(i => i.sharesOwned > 0))
    }
    setLoading(false)
  }

  const selectedInv = investments.find(i => i.property.id === selectedProperty)

  const handleSubmit = async () => {
    if (!selectedProperty || !askPrice || shares < 1) {
      setMessage('❌ Please fill in all fields')
      return
    }
    setSubmitting(true)
    setMessage('')

    const res = await api.post(
      '/api/marketplace/list',
      {
        propertyId: selectedProperty,
        shares,
        askPrice: parseFloat(askPrice),
      },
      token
    )

    if (res.ok) {
      setMessage('✅ Listing created! Your shares are now on the marketplace.')
      setSelectedProperty('')
      setShares(1)
      setAskPrice('')
    } else {
      setMessage('❌ ' + (res.error || 'Failed to create listing'))
    }
    setSubmitting(false)
  }

  if (authLoading || loading) return (
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

        <a href="/marketplace" style={{ color: '#a8c5a0', textDecoration: 'none', fontSize: '0.95rem', display: 'inline-block', marginBottom: '2rem' }}>
          ← Back to Marketplace
        </a>

        <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
          Sell Your Shares
        </h1>
        <p style={{ color: '#a8c5a0', marginBottom: '2rem' }}>
          List your land shares on the marketplace for other investors to buy.
        </p>

        <div style={{
          backgroundColor: '#132213',
          border: '1px solid rgba(200, 169, 110, 0.2)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          {investments.length === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: '#a8c5a0' }}>You don&apos;t own any shares to sell.</p>
              <a href="/parcels" style={{ color: '#c8a96e', textDecoration: 'none' }}>Browse parcels →</a>
            </div>
          ) : (
            <>
              {/* Select property */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                  Select land parcel
                </label>
                <select
                  value={selectedProperty}
                  onChange={e => { setSelectedProperty(e.target.value); setShares(1) }}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(200, 169, 110, 0.2)',
                    backgroundColor: '#0f1e0f',
                    color: '#f5f0e8',
                    fontSize: '1rem',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  <option value="">Choose a parcel...</option>
                  {investments.map(inv => (
                    <option key={inv.property.id} value={inv.property.id}>
                      {inv.property.title} ({inv.sharesOwned} shares)
                    </option>
                  ))}
                </select>
              </div>

              {selectedInv && (
                <>
                  {/* Number of shares */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                      Shares to sell (max: {selectedInv.sharesOwned})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedInv.sharesOwned}
                      value={shares}
                      onChange={e => setShares(Math.min(selectedInv.sharesOwned, Math.max(1, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                        border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
                        color: '#f5f0e8', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
                      }}
                    />
                  </div>

                  {/* Ask price */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                      Ask price per share (₹) — Original: ₹{selectedInv.property.pricePerShare.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      value={askPrice}
                      onChange={e => setAskPrice(e.target.value)}
                      placeholder={selectedInv.property.pricePerShare.toString()}
                      style={{
                        width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                        border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
                        color: '#f5f0e8', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
                      }}
                    />
                  </div>

                  {askPrice && (
                    <div style={{
                      backgroundColor: '#0f1e0f',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#a8c5a0', fontSize: '0.9rem' }}>Total listing value</span>
                        <span style={{ color: '#c8a96e', fontWeight: 'bold' }}>
                          ₹{(shares * parseFloat(askPrice)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button onClick={handleSubmit} disabled={submitting} style={{
                    width: '100%', padding: '0.9rem',
                    backgroundColor: '#c8a96e', color: '#1a2e1a', border: 'none',
                    borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold',
                    cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
                    opacity: submitting ? 0.7 : 1,
                  }}>
                    {submitting ? 'Creating Listing...' : 'List for Sale'}
                  </button>
                </>
              )}
            </>
          )}

          {message && (
            <p style={{ color: message.startsWith('❌') ? '#ef4444' : '#4ade80', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
