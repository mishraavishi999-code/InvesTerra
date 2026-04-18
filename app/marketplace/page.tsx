'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface Listing {
  id: string
  shares: number
  askPrice: number
  status: string
  property: {
    id: string
    title: string
    location: string
    pricePerShare: number
  }
  seller: {
    id: string
    name: string | null
    walletAddress: string | null
  }
}

export default function MarketplacePage() {
  const { user, token } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const res = await api.get<{ listings: Listing[] }>('/api/marketplace')
    if (res.ok && res.data) {
      setListings(res.data.listings)
    }
    setLoading(false)
  }

  const handleBuy = async (listing: Listing) => {
    if (!user || !token) {
      window.location.href = '/auth'
      return
    }

    setBuying(listing.id)
    setMessage('')

    const totalAmount = listing.askPrice * listing.shares

    const orderRes = await api.post<{ order: { id: string; amount: number } }>(
      '/api/payments/razorpay/create',
      { amount: totalAmount, propertyId: listing.property.id, shares: listing.shares },
      token
    )

    if (orderRes.ok && orderRes.data) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.data.order.amount,
        currency: 'INR',
        name: 'InvesTerra Marketplace',
        description: `${listing.shares} share(s) of ${listing.property.title}`,
        order_id: orderRes.data.order.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          const verifyRes = await api.post<{ verified: boolean; paymentId: string }>(
            '/api/payments/razorpay/verify',
            response,
            token
          )

          if (verifyRes.ok && verifyRes.data?.verified) {
            const res = await api.post(
              '/api/marketplace/buy',
              { listingId: listing.id, paymentId: verifyRes.data.paymentId, paymentMethod: 'RAZORPAY' },
              token
            )

            if (res.ok) {
              setMessage(`✅ Successfully purchased ${listing.shares} share(s) of ${listing.property.title}!`)
              fetchListings()
            } else {
              setMessage('❌ Payment verified but transfer failed: ' + (res.error || 'Server error'))
            }
          } else {
            setMessage('❌ Payment verification failed.')
          }
          setBuying(null)
        },
        prefill: { email: user.email, name: user.name || '' },
        theme: { color: '#c8a96e' },
        modal: {
          ondismiss: function () {
            setBuying(null)
          }
        }
      }

      if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: new (options: unknown) => { open: () => void } }).Razorpay) {
        const rzp = new ((window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay)(options)
        rzp.open()
      } else {
        setMessage('❌ Razorpay SDK not loaded. Please ensure you are connected to the internet.')
        setBuying(null)
      }
    } else {
      setMessage('❌ Payment Initialization Failed: ' + (orderRes.error || 'Please check Razorpay keys.'))
      setBuying(null)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      paddingTop: '6rem',
      paddingBottom: '4rem'
    }}>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
            Secondary Market
          </div>
          <h1 style={{ color: '#f5f0e8', fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 1rem 0' }}>
            Share Marketplace
          </h1>
          <p style={{ color: '#a8c5a0', fontSize: '1.1rem', margin: 0 }}>
            Buy and sell land shares from other investors
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            backgroundColor: message.startsWith('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(74, 222, 128, 0.1)',
            border: `1px solid ${message.startsWith('❌') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            color: message.startsWith('❌') ? '#ef4444' : '#4ade80',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            {message}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <a href="/marketplace/sell" style={{
            backgroundColor: '#c8a96e',
            color: '#1a2e1a',
            padding: '0.7rem 1.5rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}>
            📤 Sell Your Shares
          </a>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: '#a8c5a0', fontSize: '1.1rem' }}>
            Loading marketplace...
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <p style={{ color: '#a8c5a0', fontSize: '1.1rem' }}>
              No active listings right now. Be the first to list your shares!
            </p>
          </div>
        )}

        {/* Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {listings.map((listing) => (
            <div key={listing.id} style={{
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
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#f5f0e8', margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
                  {listing.property.title}
                </h3>
                <div style={{ color: '#c8a96e', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  📍 {listing.property.location}
                </div>
                <div style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>
                  {listing.shares} share{listing.shares > 1 ? 's' : ''} •
                  Seller: {listing.seller.name || 'Anonymous'}
                  {listing.seller.walletAddress && (
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>
                      {' '}({listing.seller.walletAddress.slice(0, 6)}...{listing.seller.walletAddress.slice(-4)})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#c8a96e', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  ₹{listing.askPrice.toLocaleString()}/share
                </div>
                <div style={{ color: '#a8c5a0', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Total: ₹{(listing.askPrice * listing.shares).toLocaleString()}
                </div>
                {listing.askPrice < listing.property.pricePerShare && (
                  <div style={{ color: '#4ade80', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    {((1 - listing.askPrice / listing.property.pricePerShare) * 100).toFixed(0)}% below original
                  </div>
                )}
                <button
                  onClick={() => handleBuy(listing)}
                  disabled={buying === listing.id || listing.seller.id === user?.id}
                  style={{
                    backgroundColor: listing.seller.id === user?.id ? '#333' : '#c8a96e',
                    color: '#1a2e1a',
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '25px',
                    cursor: listing.seller.id === user?.id ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    fontFamily: 'Georgia, serif',
                    opacity: buying === listing.id ? 0.7 : 1,
                  }}
                >
                  {listing.seller.id === user?.id
                    ? 'Your Listing'
                    : buying === listing.id
                      ? 'Buying...'
                      : 'Buy Shares'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
