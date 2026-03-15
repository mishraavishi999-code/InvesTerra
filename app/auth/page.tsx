'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else setMessage('✅ Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else window.location.href = '/'
    }
    setLoading(false)
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
              boxSizing: 'border-box'
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
              boxSizing: 'border-box'
            }}
          />
        </div>
        {/* Google button */}
            <button
            onClick={async () => {
                await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'http://localhost:3000'
                }
                })
            }}
            style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: 'transparent',
                color: '#f5f0e8',
                border: '1px solid rgba(200, 169, 110, 0.3)',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem'
            }}
            >
            <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
            </button>

{/* Divider */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1rem'
}}>
  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(200, 169, 110, 0.2)' }}/>
  <span style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>or</span>
  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(200, 169, 110, 0.2)' }}/>
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
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {/* Message */}
        {message && (
          <p style={{ color: '#a8c5a0', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            {message}
          </p>
        )}

        {/* Toggle */}
        <p style={{ color: '#a8c5a0', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: '#c8a96e', cursor: 'pointer', marginLeft: '0.4rem' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

      </div>
    </main>
  )
}