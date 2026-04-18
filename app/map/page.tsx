'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '600px',
      backgroundColor: '#1a3a1a',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a8c5a0',
      fontSize: '1.1rem'
    }}>
      Loading map...
    </div>
  )
})

interface Property {
  id: string
  title: string
  latitude: number
  longitude: number
  availableShares: number
  pricePerShare: number
}

export default function MapPage() {
  const [parcels, setParcels] = useState<Property[]>([])

  useEffect(() => {
    const fetchParcels = async () => {
      const res = await api.get<{ properties: Property[] }>('/api/properties')
      if (res.ok && res.data) {
        // Map to format expected by MapComponent
        setParcels(res.data.properties.map(p => ({
          ...p,
          id: p.id,
          available_shares: p.availableShares,
          price_per_share: p.pricePerShare,
        })) as unknown as Property[])
      }
    }
    fetchParcels()
  }, [])

  // Convert to format MapComponent expects
  const mapParcels = parcels.map(p => ({
    id: p.id,
    title: (p as unknown as { title: string }).title,
    latitude: p.latitude,
    longitude: p.longitude,
    available_shares: p.availableShares,
    price_per_share: p.pricePerShare,
  }))

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

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
            Explore
          </div>
          <h1 style={{
            color: '#f5f0e8',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            margin: '0 0 1rem 0'
          }}>
            Land Parcel Map
          </h1>
          <p style={{ color: '#a8c5a0', fontSize: '1.1rem', margin: 0 }}>
            Click any marker to explore that land parcel
          </p>
        </div>

        {/* Map */}
        <MapComponent parcels={mapParcels} />

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a8c5a0', fontSize: '0.9rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#c8a96e' }}/>
            Available parcels
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a8c5a0', fontSize: '0.9rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#a8c5a0' }}/>
            Fully owned
          </div>
        </div>

      </div>
    </main>
  )
}