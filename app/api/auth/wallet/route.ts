import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWalletSignature, signToken, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { address, message, signature } = await req.json()

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Address, message, and signature are required' },
        { status: 400 }
      )
    }

    // Verify the signature
    const valid = verifyWalletSignature(message, signature, address)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid wallet signature' },
        { status: 401 }
      )
    }

    // Find or create user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
    })

    if (!user) {
      // Create a new wallet-only user
      const randomPassword = await hashPassword(
        Math.random().toString(36).slice(2) + Date.now()
      )
      user = await prisma.user.create({
        data: {
          email: `${address.toLowerCase().slice(0, 10)}@wallet.investerra.in`,
          passwordHash: randomPassword,
          walletAddress: address.toLowerCase(),
          name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
        },
      })
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
        walletAddress: user.walletAddress,
      },
    })
  } catch (error) {
    console.error('Wallet auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
