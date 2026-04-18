import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import Razorpay from 'razorpay'

// POST /api/payments/razorpay/create — create a Razorpay order
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, propertyId, shares } = await req.json()

    if (!amount || !propertyId || !shares) {
      return NextResponse.json(
        { error: 'Amount, property ID, and shares required' },
        { status: 400 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `inv_${propertyId.slice(-8)}_${Date.now()}`,
      notes: {
        userId: auth.userId,
        propertyId,
        shares: shares.toString(),
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Razorpay create error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
