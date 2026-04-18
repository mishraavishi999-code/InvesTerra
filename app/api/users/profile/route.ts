import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/users/profile — get profile
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      walletAddress: true,
      kycStatus: true,
      role: true,
      createdAt: true,
      _count: { select: { investments: true, kycDocuments: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

// PUT /api/users/profile — update profile
export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, phone } = await req.json()

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      walletAddress: true,
      kycStatus: true,
      role: true,
    },
  })

  return NextResponse.json({ user })
}
