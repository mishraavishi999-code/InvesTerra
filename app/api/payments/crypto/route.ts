import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { ethers } from 'ethers'

// POST /api/payments/crypto — verify and record a crypto payment
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { txHash, propertyId, shares, paymentMethod } = await req.json()

    if (!txHash || !propertyId || !shares) {
      return NextResponse.json(
        { error: 'Transaction hash, property ID, and shares required' },
        { status: 400 }
      )
    }

    // Verify transaction on-chain
    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC
    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'Blockchain RPC not configured' },
        { status: 500 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction not found on-chain. It may still be pending.' },
        { status: 400 }
      )
    }

    if (receipt.status !== 1) {
      return NextResponse.json(
        { error: 'Transaction failed on-chain' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verified: true,
      txHash,
      blockNumber: receipt.blockNumber,
      paymentMethod: paymentMethod || 'CRYPTO_MATIC',
    })
  } catch (error) {
    console.error('Crypto payment error:', error)
    return NextResponse.json(
      { error: 'Failed to verify crypto payment' },
      { status: 500 }
    )
  }
}
