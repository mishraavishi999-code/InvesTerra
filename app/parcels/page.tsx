'use client'
import { useEffect, useState } from 'react'
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
  imageUrl: string | null
}

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParcels = async () => {
      const res = await api.get<{ properties: Property[] }>('/api/properties')
      if (res.ok && res.data) {
        setParcels(res.data.properties)
      }
      setLoading(false)
    }
    fetchParcels()
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      paddingTop: '6rem',
      paddingBottom: '4rem'
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 2rem' }}>
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
          Available Now
        </div>
        <h1 style={{
          color: '#f5f0e8',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          margin: '0 0 1rem 0'
        }}>
          Browse Land Parcels
        </h1>
        <p style={{ color: '#a8c5a0', fontSize: '1.1rem', margin: 0 }}>
          Find your perfect piece of land and start co-owning today
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#a8c5a0', fontSize: '1.1rem' }}>
          Loading parcels...
        </div>
      )}

      {/* Parcels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {parcels.map((parcel) => (
          <div
            key={parcel.id}
            style={{
              backgroundColor: '#132213',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200, 169, 110, 0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200, 169, 110, 0.2)'
            }}
            onClick={() => window.location.href = `/parcels/${parcel.id}`}
          >
            {/* Image placeholder */}
            <div style={{
              height: '200px',
              backgroundColor: '#1a3a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              position: 'relative'
            }}>
              🌿
              {/* Available shares badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(15, 30, 15, 0.85)',
                border: '1px solid rgba(200, 169, 110, 0.3)',
                color: '#c8a96e',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontFamily: 'Georgia, serif'
              }}>
                {parcel.availableShares} shares left
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{
                color: '#f5f0e8',
                margin: '0 0 0.3rem 0',
                fontSize: '1.2rem'
              }}>
                {parcel.title}
              </h3>
              <div style={{ color: '#c8a96e', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                📍 {parcel.location}
              </div>
              <p style={{
                color: '#a8c5a0',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {parcel.description}
              </p>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(200, 169, 110, 0.15)',
                paddingTop: '1rem'
              }}>
                <div>
                  <div style={{ color: '#a8c5a0', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    Price per share
                  </div>
                  <div style={{ color: '#c8a96e', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ₹{parcel.pricePerShare.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#a8c5a0', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    Total area
                  </div>
                  <div style={{ color: '#f5f0e8', fontWeight: 'bold' }}>
                    {parcel.totalArea} acres
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#a8c5a0', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    Total shares
                  </div>
                  <div style={{ color: '#f5f0e8', fontWeight: 'bold' }}>
                    {parcel.totalShares}
                  </div>
                </div>
              </div>

              {/* Button */}
              <button style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.8rem',
                backgroundColor: '#c8a96e',
                color: '#1a2e1a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}>
                View Parcel →
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}