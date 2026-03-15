'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

export default function MapPage() {
  const [parcels, setParcels] = useState<any[]>([])

  useEffect(() => {
    const fetchParcels = async () => {
      const { data } = await supabase
        .from('land_parcels')
        .select('*')
      setParcels(data || [])
    }
    fetchParcels()
  }, [])

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
        <MapComponent parcels={parcels} />

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