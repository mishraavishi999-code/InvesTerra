'use client'
import { useWeb3 } from '@/contexts/Web3Context'

export default function WalletButton() {
  const { walletAddress, connecting, connect, disconnect } = useWeb3()

  if (walletAddress) {
    return (
      <button
        onClick={disconnect}
        style={{
          backgroundColor: 'rgba(200, 169, 110, 0.1)',
          border: '1px solid rgba(200, 169, 110, 0.3)',
          color: '#c8a96e',
          padding: '0.5rem 1rem',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'Georgia, serif',
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#4ade80',
          display: 'inline-block',
        }}/>
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid rgba(200, 169, 110, 0.3)',
        color: '#a8c5a0',
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        cursor: connecting ? 'not-allowed' : 'pointer',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontFamily: 'Georgia, serif',
        opacity: connecting ? 0.6 : 1,
      }}
    >
      🦊 {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
