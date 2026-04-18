import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/kyc/admin — list all pending KYC documents (admin only)
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  const documents = await prisma.kycDocument.findMany({
    where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ documents })
}

// PUT /api/kyc/admin — approve/reject a KYC document (admin only)
export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { documentId, status, adminNotes } = await req.json()

    if (!documentId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Document ID and valid status required' },
        { status: 400 }
      )
    }

    const document = await prisma.kycDocument.update({
      where: { id: documentId },
      data: { status, adminNotes: adminNotes || null },
    })

    // If approved, check all docs for this user and update user KYC status
    if (status === 'APPROVED') {
      const allDocs = await prisma.kycDocument.findMany({
        where: { userId: document.userId },
      })
      const allApproved = allDocs.every((d) => d.status === 'APPROVED')
      if (allApproved) {
        await prisma.user.update({
          where: { id: document.userId },
          data: { kycStatus: 'APPROVED' },
        })
      }
    } else if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: document.userId },
        data: { kycStatus: 'REJECTED' },
      })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('KYC admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
