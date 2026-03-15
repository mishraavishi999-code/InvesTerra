'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapComponent({ parcels }: { parcels: any[] }) {
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(200, 169, 110, 0.2)' }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {parcels.map((parcel) => (
          <Marker key={parcel.id} position={[parcel.latitude, parcel.longitude]}>
            <Popup>
              <div style={{ fontFamily: 'Georgia, serif', minWidth: '180px', padding: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a2e1a' }}>{parcel.title}</h3>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem' }}>{parcel.available_shares} shares left</p>
                <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem' }}>Rs.{parcel.price_per_share} per share</p>
                <a href={'/parcels/' + parcel.id} style={{ background: '#c8a96e', color: '#1a2e1a', padding: '0.4rem 1rem', borderRadius: '20px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  View Parcel
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}