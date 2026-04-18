import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// POST /api/marketplace/list — create a new listing
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { propertyId, shares, askPrice } = await req.json()

    if (!propertyId || !shares || !askPrice) {
      return NextResponse.json(
        { error: 'Property ID, shares, and ask price required' },
        { status: 400 }
      )
    }

    // Verify user owns enough shares
    const investment = await prisma.investment.findFirst({
      where: {
        userId: auth.userId,
        propertyId,
        status: 'CONFIRMED',
      },
    })

    if (!investment || investment.sharesOwned < shares) {
      return NextResponse.json(
        { error: 'You do not own enough shares to list' },
        { status: 400 }
      )
    }

    // Check total already listed
    const alreadyListed = await prisma.listing.aggregate({
      where: {
        sellerId: auth.userId,
        propertyId,
        status: 'ACTIVE',
      },
      _sum: { shares: true },
    })

    const listedShares = alreadyListed._sum.shares || 0
    if (investment.sharesOwned - listedShares < shares) {
      return NextResponse.json(
        { error: `Only ${investment.sharesOwned - listedShares} unlisted shares available` },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: auth.userId,
        propertyId,
        shares,
        askPrice,
      },
      include: { property: true },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
