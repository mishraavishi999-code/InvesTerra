'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string | null
  phone?: string | null
  walletAddress: string | null
  kycStatus: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string, name?: string) => Promise<string | null>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('investerra_token')
    if (stored) {
      setToken(stored)
      fetchUser(stored)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (t: string) => {
    const res = await api.get<{ user: User }>('/api/auth/me', t)
    if (res.ok && res.data) {
      setUser(res.data.user)
    } else {
      // Token is invalid, clear it
      localStorage.removeItem('investerra_token')
      setToken(null)
      setUser(null)
    }
    setLoading(false)
  }

  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await api.post<{ token: string; user: User }>(
      '/api/auth/login',
      { email, password }
    )
    if (res.ok && res.data) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('investerra_token', res.data.token)
      return null
    }
    return res.error || 'Login failed'
  }

  const register = async (email: string, password: string, name?: string): Promise<string | null> => {
    const res = await api.post<{ token: string; user: User }>(
      '/api/auth/register',
      { email, password, name }
    )
    if (res.ok && res.data) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('investerra_token', res.data.token)
      return null
    }
    return res.error || 'Registration failed'
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('investerra_token')
  }

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token)
  }, [token])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
