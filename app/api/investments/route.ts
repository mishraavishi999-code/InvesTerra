import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/investments — list user investments
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const investments = await prisma.investment.findMany({
    where: { userId: auth.userId },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ investments })
}

// POST /api/investments — create a new investment (after payment)
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { propertyId, shares, paymentId, paymentMethod } = await req.json()

    if (!propertyId || !shares || shares < 1) {
      return NextResponse.json(
        { error: 'Property ID and number of shares required' },
        { status: 400 }
      )
    }

    // Get property and validate availability
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.availableShares < shares) {
      return NextResponse.json(
        { error: `Only ${property.availableShares} shares available` },
        { status: 400 }
      )
    }

    // Create investment + transaction + update property in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check or upsert existing investment
      const existing = await tx.investment.findFirst({
        where: { userId: auth.userId, propertyId, status: 'CONFIRMED' },
      })

      let investment
      if (existing) {
        investment = await tx.investment.update({
          where: { id: existing.id },
          data: { sharesOwned: existing.sharesOwned + shares },
        })
      } else {
        investment = await tx.investment.create({
          data: {
            userId: auth.userId,
            propertyId,
            sharesOwned: shares,
            purchasePrice: property.pricePerShare,
            status: 'CONFIRMED',
          },
        })
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          toUserId: auth.userId,
          propertyId,
          shares,
          pricePerShare: property.pricePerShare,
          totalAmount: shares * property.pricePerShare,
          type: 'BUY',
          paymentMethod: paymentMethod || 'RAZORPAY',
          paymentId: paymentId || null,
          status: 'COMPLETED',
        },
      })

      // Decrement available shares
      await tx.property.update({
        where: { id: propertyId },
        data: {
          availableShares: { decrement: shares },
          status:
            property.availableShares - shares <= 0 ? 'SOLD_OUT' : 'ACTIVE',
        },
      })

      return { investment, transaction }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Investment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
