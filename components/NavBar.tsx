'use client'
import { useAuth } from '@/contexts/AuthContext'
import WalletButton from './WalletButton'
import { Globe2, Map, PieChart } from 'lucide-react'

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      padding: '1.2rem 3rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(15, 30, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <a href="/" style={{ color: '#f5f0e8', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Globe2 size={26} color="#c8a96e" /> InvesTerra
      </a>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="/parcels" style={{ color: '#a8c5a0', textDecoration: 'none', fontSize: '0.95rem' }}>
          Browse
        </a>
        <a href="/map" style={{ color: '#a8c5a0', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Map size={16} /> Map
        </a>
        <a href="/marketplace" style={{ color: '#a8c5a0', textDecoration: 'none', fontSize: '0.95rem' }}>
          Marketplace
        </a>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <WalletButton />
        {user ? (
          <>
            {/* User avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#c8a96e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a2e1a',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {(user.name || user.email)?.[0].toUpperCase()}
            </div>

            {/* Dashboard button */}
            <a href="/dashboard" style={{
              color: '#a8c5a0',
              fontSize: '0.85rem',
              textDecoration: 'none',
              backgroundColor: 'rgba(200, 169, 110, 0.1)',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(200, 169, 110, 0.25)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200, 169, 110, 0.6)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#c8a96e'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(200, 169, 110, 0.1)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200, 169, 110, 0.2)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#a8c5a0'
            }}
            >
              <PieChart size={16} /> My Portfolio
            </a>

            {/* Sign out */}
            <button
              onClick={logout}
              style={{
                backgroundColor: 'transparent',
                color: '#c8a96e',
                border: '1px solid rgba(200, 169, 110, 0.3)',
                padding: '0.5rem 1.2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'Georgia, serif'
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <a href="/auth" style={{
            backgroundColor: '#c8a96e',
            color: '#1a2e1a',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}>
            Sign In
          </a>
        )}
      </div>
    </nav>
  )
}
