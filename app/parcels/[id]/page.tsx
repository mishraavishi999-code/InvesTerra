'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

export default function ParcelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [parcel, setParcel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [shares, setShares] = useState(1)
  const [buying, setBuying] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Get parcel details
    const fetchParcel = async () => {
      const { data } = await supabase
        .from('land_parcels')
        .select('*')
        .eq('id', id)
        .single()
      setParcel(data)
      setLoading(false)
    }
    fetchParcel()
  }, [id])

  const handleBuy = async () => {
    if (!user) {
      window.location.href = '/auth'
      return
    }

    setBuying(true)
    setMessage('')

    // Check enough shares available
    if (shares > parcel.available_shares) {
      setMessage('❌ Not enough shares available!')
      setBuying(false)
      return
    }

    // Record the purchase
    const { error } = await supabase
      .from('ownership_shares')
      .insert({
        parcel_id: parcel.id,
        user_id: user.id,
        shares_owned: shares
      })

    if (error) {
      setMessage('❌ Something went wrong. Please try again.')
    } else {
      // Update available shares
      await supabase
        .from('land_parcels')
        .update({ available_shares: parcel.available_shares - shares })
        .eq('id', parcel.id)

      setMessage(`✅ Congratulations! You now own ${shares} share(s) of ${parcel.title}!`)
      setParcel({ ...parcel, available_shares: parcel.available_shares - shares })
    }
    setBuying(false)
  }

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
      Loading parcel...
    </main>
  )

  if (!parcel) return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a8c5a0',
      fontSize: '1.2rem'
    }}>
      Parcel not found!
    </main>
  )

  const ownershipPercent = ((shares / parcel.total_shares) * 100).toFixed(2)
  const totalCost = shares * parcel.price_per_share

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      paddingTop: '6rem',
      paddingBottom: '4rem',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Back button */}
        <a href="/parcels" style={{
          color: '#a8c5a0',
          textDecoration: 'none',
          fontSize: '0.95rem',
          display: 'inline-block',
          marginBottom: '2rem'
        }}>
          ← Back to all parcels
        </a>

        {/* Hero image */}
        <div style={{
          height: '300px',
          backgroundColor: '#1a3a1a',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '6rem',
          marginBottom: '2rem',
          border: '1px solid rgba(200, 169, 110, 0.2)'
        }}>
          🌿
        </div>

        {/* Two column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '2rem',
          alignItems: 'start'
        }}>

          {/* Left — details */}
          <div>
            <h1 style={{
              color: '#f5f0e8',
              fontSize: '2.2rem',
              margin: '0 0 1rem 0'
            }}>
              {parcel.title}
            </h1>

            <p style={{
              color: '#a8c5a0',
              lineHeight: 1.8,
              fontSize: '1.05rem',
              marginBottom: '2rem'
            }}>
              {parcel.description}
            </p>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Total Area', value: `${parcel.total_area} acres` },
                { label: 'Total Shares', value: parcel.total_shares },
                { label: 'Available Shares', value: parcel.available_shares },
                { label: 'Price Per Share', value: `₹${parcel.price_per_share.toLocaleString()}` },
              ].map((stat) => (
                <div key={stat.label} style={{
                  backgroundColor: '#132213',
                  border: '1px solid rgba(200, 169, 110, 0.15)',
                  borderRadius: '12px',
                  padding: '1.2rem'
                }}>
                  <div style={{ color: '#a8c5a0', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ color: '#c8a96e', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — buy box */}
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            position: 'sticky',
            top: '6rem'
          }}>
            <h3 style={{ color: '#f5f0e8', margin: '0 0 1.5rem 0', fontSize: '1.3rem' }}>
              Buy Shares
            </h3>

            {/* Share selector */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                Number of shares
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setShares(Math.max(1, shares - 1))}
                  style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#0f1e0f',
                    border: '1px solid rgba(200, 169, 110, 0.3)',
                    color: '#c8a96e',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                >-</button>
                <span style={{ color: '#f5f0e8', fontSize: '1.5rem', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                  {shares}
                </span>
                <button
                  onClick={() => setShares(Math.min(parcel.available_shares, shares + 1))}
                  style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#0f1e0f',
                    border: '1px solid rgba(200, 169, 110, 0.3)',
                    color: '#c8a96e',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                >+</button>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              backgroundColor: '#0f1e0f',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#a8c5a0', fontSize: '0.9rem' }}>Ownership</span>
                <span style={{ color: '#f5f0e8', fontSize: '0.9rem' }}>{ownershipPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a8c5a0', fontSize: '0.9rem' }}>Total cost</span>
                <span style={{ color: '#c8a96e', fontWeight: 'bold' }}>₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Buy button */}
            <button
              onClick={handleBuy}
              disabled={buying}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#c8a96e',
                color: '#1a2e1a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: buying ? 'not-allowed' : 'pointer',
                opacity: buying ? 0.7 : 1
              }}
            >
              {buying ? 'Processing...' : user ? 'Buy Now →' : 'Sign In to Buy →'}
            </button>

            {/* Message */}
            {message && (
              <p style={{
                color: '#a8c5a0',
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {message}
              </p>
            )}

            <p style={{ color: '#a8c5a0', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
              {parcel.available_shares} of {parcel.total_shares} shares remaining
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}