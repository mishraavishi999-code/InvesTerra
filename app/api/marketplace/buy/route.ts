import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// POST /api/marketplace/buy — buy shares from a listing
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { listingId, paymentId, paymentMethod } = await req.json()

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        include: { property: true },
      })

      if (!listing || listing.status !== 'ACTIVE') {
        throw new Error('Listing not found or already sold')
      }

      if (listing.sellerId === auth.userId) {
        throw new Error('You cannot buy your own listing')
      }

      // Mark listing as sold
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' },
      })

      // Transfer shares: deduct from seller
      const sellerInvestment = await tx.investment.findFirst({
        where: {
          userId: listing.sellerId,
          propertyId: listing.propertyId,
          status: 'CONFIRMED',
        },
      })

      if (sellerInvestment) {
        const remaining = sellerInvestment.sharesOwned - listing.shares
        if (remaining <= 0) {
          await tx.investment.delete({ where: { id: sellerInvestment.id } })
        } else {
          await tx.investment.update({
            where: { id: sellerInvestment.id },
            data: { sharesOwned: remaining },
          })
        }
      }

      // Add to buyer
      const buyerInvestment = await tx.investment.findFirst({
        where: {
          userId: auth.userId,
          propertyId: listing.propertyId,
          status: 'CONFIRMED',
        },
      })

      if (buyerInvestment) {
        await tx.investment.update({
          where: { id: buyerInvestment.id },
          data: { sharesOwned: buyerInvestment.sharesOwned + listing.shares },
        })
      } else {
        await tx.investment.create({
          data: {
            userId: auth.userId,
            propertyId: listing.propertyId,
            sharesOwned: listing.shares,
            purchasePrice: listing.askPrice,
            status: 'CONFIRMED',
          },
        })
      }

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          fromUserId: listing.sellerId,
          toUserId: auth.userId,
          propertyId: listing.propertyId,
          shares: listing.shares,
          pricePerShare: listing.askPrice,
          totalAmount: listing.shares * listing.askPrice,
          type: 'BUY',
          paymentMethod: paymentMethod || 'RAZORPAY',
          paymentId: paymentId || null,
          status: 'COMPLETED',
        },
      })

      return { transaction, listing }
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Marketplace buy error:', error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
