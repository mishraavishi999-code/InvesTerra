import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/properties — list all active properties
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'ACTIVE'

  const properties = await prisma.property.findMany({
    where: { status: status as 'ACTIVE' | 'SOLD_OUT' | 'UPCOMING' },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ properties })
}
