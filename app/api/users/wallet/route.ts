import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// PUT /api/users/wallet — link wallet address
export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { walletAddress } = await req.json()
  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    )
  }

  const normalized = walletAddress.toLowerCase()

  // Check if wallet is already linked to another user
  const existing = await prisma.user.findUnique({
    where: { walletAddress: normalized },
  })
  if (existing && existing.id !== auth.userId) {
    return NextResponse.json(
      { error: 'This wallet is already linked to another account' },
      { status: 409 }
    )
  }

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { walletAddress: normalized },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
      kycStatus: true,
      role: true,
    },
  })

  return NextResponse.json({ user })
}
