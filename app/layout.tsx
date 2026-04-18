'use client'
import { AuthProvider } from '@/contexts/AuthContext'
import { Web3Provider } from '@/contexts/Web3Context'
import './globals.css'
import NavBar from '@/components/NavBar'

import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>InvesTerra — Own the Earth, One Share at a Time</title>
        <meta name="description" content="InvesTerra lets you co-own real land with other investors. Buy fractional shares of verified Indian land parcels, backed by blockchain." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={outfit.className} style={{ margin: 0, padding: 0, backgroundColor: '#0f1e0f' }}>
        <AuthProvider>
          <Web3Provider>
            <NavBar />
            {children}
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  )
}