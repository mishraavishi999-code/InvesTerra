import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/kyc — get user's KYC status + documents
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const documents = await prisma.kycDocument.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { kycStatus: true },
  })

  return NextResponse.json({
    kycStatus: user?.kycStatus,
    documents,
  })
}

// POST /api/kyc — submit KYC document
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentType, documentUrl } = await req.json()

    if (!documentType || !documentUrl) {
      return NextResponse.json(
        { error: 'Document type and URL are required' },
        { status: 400 }
      )
    }

    const validTypes = ['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    const document = await prisma.kycDocument.create({
      data: {
        userId: auth.userId,
        documentType,
        documentUrl,
      },
    })

    // Update user KYC status to PENDING
    await prisma.user.update({
      where: { id: auth.userId },
      data: { kycStatus: 'PENDING' },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('KYC submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
