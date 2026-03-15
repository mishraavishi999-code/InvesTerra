'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <main style={{ margin: 0, padding: 0 }}>

      {/* HERO SECTION */}
      <section style={{
        minHeight: '100vh',
        backgroundColor: '#0f1e0f',
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, #1a3a1a 0%, #0f1e0f 60%), radial-gradient(ellipse at 80% 20%, #2a4a1a 0%, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%', border: '1px solid rgba(200, 169, 110, 0.1)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
        }}/>
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', border: '1px solid rgba(200, 169, 110, 0.15)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
        }}/>

        {/* Badge */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
          backgroundColor: 'rgba(200, 169, 110, 0.15)',
          border: '1px solid rgba(200, 169, 110, 0.3)',
          color: '#c8a96e',
          padding: '0.4rem 1.2rem',
          borderRadius: '25px',
          fontSize: '0.85rem',
          marginBottom: '2rem',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Land Ownership, Reimagined
        </div>

        {/* Main heading */}
        <h1 style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.2s',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          color: '#f5f0e8',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.2,
          maxWidth: '800px'
        }}>
          Own the Earth,<br />
          <span style={{ color: '#c8a96e' }}>One Share at a Time</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.4s',
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          color: '#a8c5a0',
          maxWidth: '600px',
          lineHeight: 1.7,
          marginBottom: '3rem'
        }}>
          InvesTerra lets you co-own real land with other investors.
          Start with a single share, build your land portfolio, earn together.
        </p>

        {/* Buttons */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.6s',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button style={{
            backgroundColor: '#c8a96e',
            color: '#1a2e1a',
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            letterSpacing: '0.5px'
          }}>
          <a href="/parcels" style={{
            backgroundColor: '#c8a96e',
            color: '#1a2e1a',
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            letterSpacing: '0.5px',
            textDecoration: 'none'
          }}>
            Explore Land Parcels →
          </a>
          </button>
          <button style={{
            backgroundColor: 'transparent',
            color: '#f5f0e8',
            border: '1px solid rgba(245, 240, 232, 0.3)',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            How It Works
          </button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{
        backgroundColor: '#132213',
        padding: '4rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        flexWrap: 'wrap'
      }}>
        {[
          { number: '2,400+', label: 'Acres Available' },
          { number: '1,200+', label: 'Co-owners' },
          { number: '48', label: 'Land Parcels' },
          { number: '₹0', label: 'To Get Started' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c8a96e' }}>
              {stat.number}
            </div>
            <div style={{ color: '#a8c5a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{
        backgroundColor: '#0f1e0f',
        padding: '6rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#f5f0e8', fontSize: '2.5rem', marginBottom: '1rem' }}>
          How It Works
        </h2>
        <p style={{ color: '#a8c5a0', marginBottom: '4rem', fontSize: '1.1rem' }}>
          Three simple steps to owning real land
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { icon: '🔍', title: 'Browse Parcels', desc: 'Explore verified land parcels across India with detailed maps and documents' },
            { icon: '💰', title: 'Buy Shares', desc: 'Purchase fractional shares starting from just ₹999. Own a piece of real land.' },
            { icon: '📈', title: 'Earn Together', desc: 'Get returns from land appreciation and agricultural income with co-owners' },
          ].map((step) => (
            <div key={step.title} style={{
              backgroundColor: '#132213',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              maxWidth: '280px',
              flex: '1 1 250px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
              <h3 style={{ color: '#c8a96e', marginBottom: '0.8rem', fontSize: '1.2rem' }}>{step.title}</h3>
              <p style={{ color: '#a8c5a0', lineHeight: 1.6, fontSize: '0.95rem' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#080f08',
        color: '#a8c5a0',
        textAlign: 'center',
        padding: '2rem',
        fontSize: '0.9rem'
      }}>
        © 2026 InvesTerra — Own the Earth, Together 🌍
      </footer>

    </main>
  )
}