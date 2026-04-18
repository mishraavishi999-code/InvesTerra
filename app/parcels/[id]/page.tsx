'use client'
import { useEffect, useState, use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface Property {
  id: string
  title: string
  description: string
  location: string
  totalArea: number
  totalShares: number
  availableShares: number
  pricePerShare: number
  spvName: string | null
}

export default function ParcelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token } = useAuth()
  const [parcel, setParcel] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [shares, setShares] = useState(1)
  const [buying, setBuying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchParcel = async () => {
      const res = await api.get<{ property: Property }>(`/api/properties/${id}`)
      if (res.ok && res.data) {
        setParcel(res.data.property)
      }
      setLoading(false)
    }
    fetchParcel()
  }, [id])

  const handleBuy = async () => {
    if (!user || !token) {
      window.location.href = '/auth'
      return
    }
    if (!parcel) return

    setBuying(true)
    setMessage('')

    if (shares > parcel.availableShares) {
      setMessage('❌ Not enough shares available!')
      setBuying(false)
      return
    }

    const totalAmount = shares * parcel.pricePerShare

    const orderRes = await api.post<{ order: { id: string; amount: number } }>(
      '/api/payments/razorpay/create',
      { amount: totalAmount, propertyId: parcel.id, shares },
      token
    )

    if (orderRes.ok && orderRes.data) {
      // Load Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.data.order.amount,
        currency: 'INR',
        name: 'InvesTerra',
        description: `${shares} share(s) of ${parcel.title}`,
        order_id: orderRes.data.order.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          // Verify payment
          const verifyRes = await api.post<{ verified: boolean; paymentId: string }>(
            '/api/payments/razorpay/verify',
            response,
            token
          )

          if (verifyRes.ok && verifyRes.data?.verified) {
            // Create investment
            const investRes = await api.post(
              '/api/investments',
              {
                propertyId: parcel.id,
                shares,
                paymentId: verifyRes.data.paymentId,
                paymentMethod: 'RAZORPAY',
              },
              token
            )

            if (investRes.ok) {
              setMessage(`✅ Congratulations! You now own ${shares} share(s) of ${parcel.title}!`)
              setParcel({ ...parcel, availableShares: parcel.availableShares - shares })
            } else {
              setMessage('❌ Payment verified but investment creation failed. Contact support.')
            }
          } else {
            setMessage('❌ Payment verification failed.')
          }
          setBuying(false)
        },
        prefill: { email: user.email, name: user.name || '' },
        theme: { color: '#c8a96e' },
        modal: {
          ondismiss: function () {
            setBuying(false)
          }
        }
      }

      // Check if Razorpay script is loaded
      if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: new (options: unknown) => { open: () => void } }).Razorpay) {
        const rzp = new ((window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay)(options)
        rzp.open()
      } else {
        setMessage('❌ Razorpay SDK not loaded. Please ensure you are connected to the internet.')
        setBuying(false)
      }
    } else {
      setMessage('❌ Payment Initialization Failed: ' + (orderRes.error || 'Please check Razorpay keys.'))
      setBuying(false)
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

  const ownershipPercent = ((shares / parcel.totalShares) * 100).toFixed(2)
  const totalCost = shares * parcel.pricePerShare

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

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
            <div style={{ color: '#c8a96e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              📍 {parcel.location}
            </div>
            <h1 style={{
              color: '#f5f0e8',
              fontSize: '2.2rem',
              margin: '0 0 1rem 0'
            }}>
              {parcel.title}
            </h1>

            {parcel.spvName && (
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(200, 169, 110, 0.1)',
                border: '1px solid rgba(200, 169, 110, 0.2)',
                color: '#c8a96e',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                marginBottom: '1.5rem'
              }}>
                🏛️ {parcel.spvName}
              </div>
            )}

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
                { label: 'Total Area', value: `${parcel.totalArea} acres` },
                { label: 'Total Shares', value: parcel.totalShares },
                { label: 'Available Shares', value: parcel.availableShares },
                { label: 'Price Per Share', value: `₹${parcel.pricePerShare.toLocaleString()}` },
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
                  onClick={() => setShares(Math.min(parcel.availableShares, shares + 1))}
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
                opacity: buying ? 0.7 : 1,
                fontFamily: 'Georgia, serif',
              }}
            >
              {buying ? 'Processing...' : user ? 'Buy Now →' : 'Sign In to Buy →'}
            </button>

            {/* Message */}
            {message && (
              <p style={{
                color: message.startsWith('❌') ? '#ef4444' : '#a8c5a0',
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {message}
              </p>
            )}

            <p style={{ color: '#a8c5a0', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
              {parcel.availableShares} of {parcel.totalShares} shares remaining
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}