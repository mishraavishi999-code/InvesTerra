'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [holdings, setHoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (!currentUser) {
        window.location.href = '/auth'
        return
      }

      // Get all shares owned by this user
      const { data: shares } = await supabase
        .from('ownership_shares')
        .select('*, land_parcels(*)')
        .eq('user_id', currentUser.id)

      setHoldings(shares || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => {
    return sum + (h.shares_owned * h.land_parcels.price_per_share)
  }, 0)

  const totalShares = holdings.reduce((sum, h) => sum + h.shares_owned, 0)

  if (loading) return (
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
            Welcome back! 👋
          </h1>
          <p style={{ color: '#a8c5a0', fontSize: '1rem', margin: 0 }}>
            {user?.email}
          </p>
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
            { label: 'Land Parcels', value: holdings.length, icon: '🌿' },
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

        {holdings.length === 0 ? (
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <p style={{ color: '#a8c5a0', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              You don't own any shares yet!
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
            {holdings.map((holding) => (
              <div key={holding.id} style={{
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
                      {holding.land_parcels.title}
                    </h3>
                    <p style={{ color: '#a8c5a0', margin: 0, fontSize: '0.85rem' }}>
                      {holding.shares_owned} share{holding.shares_owned > 1 ? 's' : ''} •{' '}
                      {((holding.shares_owned / holding.land_parcels.total_shares) * 100).toFixed(2)}% ownership
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#c8a96e', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    ₹{(holding.shares_owned * holding.land_parcels.price_per_share).toLocaleString()}
                  </div>
                  <div style={{ color: '#a8c5a0', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    ₹{holding.land_parcels.price_per_share.toLocaleString()} per share
                  </div>
                  <a href={`/parcels/${holding.land_parcels.id}`} style={{
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