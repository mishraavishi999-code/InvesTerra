'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { connectWallet, getWalletAddress, signMessage, switchToAmoy } from '@/lib/web3'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

interface Web3ContextType {
  walletAddress: string | null
  connecting: boolean
  connect: () => Promise<string | null>
  disconnect: () => void
  linkWallet: () => Promise<string | null>
  walletAuth: () => Promise<string | null>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const { token, refreshUser } = useAuth()

  // Auto-detect connected wallet on mount
  useEffect(() => {
    getWalletAddress().then((addr) => {
      if (addr) setWalletAddress(addr)
    })

    // Listen for account changes
    if (typeof window !== 'undefined') {
      const ethereum = (window as unknown as { ethereum?: { on?: (event: string, handler: (accounts: string[]) => void) => void } }).ethereum
      ethereum?.on?.('accountsChanged', (accounts: string[]) => {
        setWalletAddress(accounts[0] || null)
      })
    }
  }, [])

  const connect = async (): Promise<string | null> => {
    setConnecting(true)
    try {
      await switchToAmoy()
      const addr = await connectWallet()
      if (addr) {
        setWalletAddress(addr)
      }
      return addr
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
  }

  // Link current wallet to logged-in account
  const linkWallet = useCallback(async (): Promise<string | null> => {
    if (!walletAddress || !token) return 'Connect wallet and login first'

    const res = await api.put(
      '/api/users/wallet',
      { walletAddress },
      token
    )
    if (res.ok) {
      await refreshUser()
      return null
    }
    return res.error || 'Failed to link wallet'
  }, [walletAddress, token, refreshUser])

  // Authenticate with wallet signature
  const walletAuth = useCallback(async (): Promise<string | null> => {
    if (!walletAddress) {
      const addr = await connect()
      if (!addr) return 'Failed to connect wallet'
    }

    const message = `Sign this message to login to InvesTerra.\nNonce: ${Date.now()}-${Math.random().toString(36).slice(2)}`
    const signature = await signMessage(message)
    if (!signature) return 'Signature rejected'

    const res = await api.post<{ token: string }>('/api/auth/wallet', {
      address: walletAddress,
      message,
      signature,
    })

    if (res.ok && res.data) {
      localStorage.setItem('investerra_token', res.data.token)
      window.location.reload()
      return null
    }
    return res.error || 'Wallet auth failed'
  }, [walletAddress])

  return (
    <Web3Context.Provider
      value={{ walletAddress, connecting, connect, disconnect, linkWallet, walletAuth }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) throw new Error('useWeb3 must be inside Web3Provider')
  return ctx
}
