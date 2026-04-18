'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const { walletAuth, connecting } = useWeb3()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    let error: string | null
    if (isSignUp) {
      error = await register(email, password, name || undefined)
    } else {
      error = await login(email, password)
    }

    if (error) {
      setMessage('❌ ' + error)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleWalletLogin = async () => {
    setMessage('')
    const error = await walletAuth()
    if (error) {
      setMessage('❌ ' + error)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#132213',
        border: '1px solid rgba(200, 169, 110, 0.2)',
        borderRadius: '20px',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌍</div>
          <h1 style={{ color: '#f5f0e8', fontSize: '1.8rem', margin: 0 }}>InvesTerra</h1>
          <p style={{ color: '#a8c5a0', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Wallet login button */}
        <button
          onClick={handleWalletLogin}
          disabled={connecting}
          style={{
            width: '100%',
            padding: '0.9rem',
            backgroundColor: 'transparent',
            color: '#f5f0e8',
            border: '1px solid rgba(200, 169, 110, 0.3)',
            borderRadius: '10px',
            fontSize: '1rem',
            cursor: connecting ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            fontFamily: 'Georgia, serif',
            opacity: connecting ? 0.6 : 1,
          }}
        >
          🦊 {connecting ? 'Connecting...' : 'Sign in with MetaMask'}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(200, 169, 110, 0.2)' }}/>
          <span style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(200, 169, 110, 0.2)' }}/>
        </div>

        {/* Name input (sign up only) */}
        {isSignUp && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(200, 169, 110, 0.2)',
                backgroundColor: '#0f1e0f',
                color: '#f5f0e8',
                fontSize: '1rem',
                boxSizing: 'border-box',
                fontFamily: 'Georgia, serif',
              }}
            />
          </div>
        )}

        {/* Email input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              backgroundColor: '#0f1e0f',
              color: '#f5f0e8',
              fontSize: '1rem',
              boxSizing: 'border-box',
              fontFamily: 'Georgia, serif',
            }}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              backgroundColor: '#0f1e0f',
              color: '#f5f0e8',
              fontSize: '1rem',
              boxSizing: 'border-box',
              fontFamily: 'Georgia, serif',
            }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem',
            backgroundColor: '#c8a96e',
            color: '#1a2e1a',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: 'Georgia, serif',
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {/* Message */}
        {message && (
          <p style={{ color: message.startsWith('❌') ? '#ef4444' : '#a8c5a0', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            {message}
          </p>
        )}

        {/* Toggle */}
        <p style={{ color: '#a8c5a0', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            style={{ color: '#c8a96e', cursor: 'pointer', marginLeft: '0.4rem' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

      </div>
    </main>
  )
}