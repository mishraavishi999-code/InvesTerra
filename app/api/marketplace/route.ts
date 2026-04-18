import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/marketplace — list active marketplace listings
export async function GET(req: NextRequest) {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      property: true,
      seller: {
        select: { id: true, name: true, walletAddress: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ listings })
}
