import 'dotenv/config'

import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is missing. Please copy .env.example to .env and set your database URL.')
    process.exit(1)
  }

  console.log('🌱 Seeding InvesTerra database...\n')

  // ── Create admin user ───────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@investerra.in' },
    update: {
      walletAddress: '0x2764F65774895B43546c398E14cBA1c1F354C3C0'.toLowerCase(),
    },
    create: {
      email: 'admin@investerra.in',
      passwordHash: adminPassword,
      name: 'InvesTerra Admin',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      walletAddress: '0x2764F65774895B43546c398E14cBA1c1F354C3C0'.toLowerCase(),
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // ── Create demo user ───────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@investerra.in' },
    update: {},
    create: {
      email: 'demo@investerra.in',
      passwordHash: userPassword,
      name: 'Demo Investor',
      phone: '+91 98765 43210',
      kycStatus: 'APPROVED',
    },
  })
  console.log('✅ Demo user created:', user.email)

  // ── Create properties ──────────────────────────────────────────────────────
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Green Valley Estate — Dehradun',
        description:
          'Premium agricultural land in the lush Doon Valley, surrounded by Himalayan foothills. Ideal for organic farming and eco-tourism. The region sees 15-20% annual land appreciation with growing demand for wellness retreats.',
        location: 'Dehradun, Uttarakhand',
        totalArea: 50,
        latitude: 30.3165,
        longitude: 78.0322,
        totalShares: 500,
        availableShares: 340,
        pricePerShare: 4999,
        status: 'ACTIVE',
        spvName: 'Green Valley SPV Pvt. Ltd.',
        imageUrl: '/parcels/dehradun.jpg',
      },
    }),
    prisma.property.create({
      data: {
        title: 'Coastal Coconut Grove — Goa',
        description:
          'Beachside coconut plantation just 3 km from Palolem Beach. Revenue from coconut harvesting plus massive tourism-driven land appreciation. Title verified, NA conversion possible for resort development.',
        location: 'South Goa, Goa',
        totalArea: 25,
        latitude: 15.0101,
        longitude: 74.0239,
        totalShares: 1000,
        availableShares: 720,
        pricePerShare: 2499,
        status: 'ACTIVE',
        spvName: 'Coastal Coconut SPV Pvt. Ltd.',
        imageUrl: '/parcels/goa.jpg',
      },
    }),
    prisma.property.create({
      data: {
        title: 'Golden Sands — Jaisalmer',
        description:
          'Desert land near Sam Sand Dunes with approved solar farm potential. Government subsidies available for renewable energy projects. Strategic location on upcoming highway corridor.',
        location: 'Jaisalmer, Rajasthan',
        totalArea: 100,
        latitude: 26.9157,
        longitude: 70.9083,
        totalShares: 2000,
        availableShares: 1850,
        pricePerShare: 999,
        status: 'ACTIVE',
        spvName: 'Golden Sands SPV Pvt. Ltd.',
        imageUrl: '/parcels/jaisalmer.jpg',
      },
    }),
    prisma.property.create({
      data: {
        title: 'Wine Country Ranch — Nashik',
        description:
          'Vineyard-ready land in India\'s wine capital. Existing irrigation infrastructure and soil tested for grape cultivation. Partnership opportunity with local wineries for revenue sharing.',
        location: 'Nashik, Maharashtra',
        totalArea: 35,
        latitude: 20.0063,
        longitude: 73.7902,
        totalShares: 700,
        availableShares: 500,
        pricePerShare: 3499,
        status: 'ACTIVE',
        spvName: 'Wine Country SPV Pvt. Ltd.',
        imageUrl: '/parcels/nashik.jpg',
      },
    }),
    prisma.property.create({
      data: {
        title: 'Spice Highlands — Wayanad',
        description:
          'Lush spice plantation in the Western Ghats producing pepper, cardamom, and coffee. Sustainable income from existing harvests plus eco-tourism potential with homestay approvals.',
        location: 'Wayanad, Kerala',
        totalArea: 20,
        latitude: 11.6854,
        longitude: 76.132,
        totalShares: 400,
        availableShares: 280,
        pricePerShare: 5999,
        status: 'ACTIVE',
        spvName: 'Spice Highlands SPV Pvt. Ltd.',
        imageUrl: '/parcels/wayanad.jpg',
      },
    }),
    prisma.property.create({
      data: {
        title: 'Tech Corridor Plot — Hyderabad',
        description:
          'Strategic plot near the Hyderabad-Bengaluru industrial corridor. Zoned for commercial development with metro connectivity planned by 2028. Ideal for long-term capital appreciation.',
        location: 'Shamshabad, Hyderabad',
        totalArea: 10,
        latitude: 17.2403,
        longitude: 78.4294,
        totalShares: 200,
        availableShares: 60,
        pricePerShare: 14999,
        status: 'ACTIVE',
        spvName: 'Tech Corridor SPV Pvt. Ltd.',
        imageUrl: '/parcels/hyderabad.jpg',
      },
    }),
  ])

  console.log(`✅ ${properties.length} properties created`)

  // ── Create a sample investment for demo user ───────────────────────────────
  await prisma.investment.create({
    data: {
      userId: user.id,
      propertyId: properties[0].id,
      sharesOwned: 10,
      purchasePrice: 4999,
      status: 'CONFIRMED',
    },
  })
  console.log('✅ Sample investment created for demo user')

  // ── Create a sample transaction ────────────────────────────────────────────
  await prisma.transaction.create({
    data: {
      toUserId: user.id,
      propertyId: properties[0].id,
      shares: 10,
      pricePerShare: 4999,
      totalAmount: 49990,
      type: 'BUY',
      paymentMethod: 'RAZORPAY',
      status: 'COMPLETED',
    },
  })
  console.log('✅ Sample transaction created')

  // ── Create a sample marketplace listing ────────────────────────────────────
  await prisma.listing.create({
    data: {
      sellerId: user.id,
      propertyId: properties[0].id,
      shares: 5,
      askPrice: 5499,
      status: 'ACTIVE',
    },
  })
  console.log('✅ Sample marketplace listing created')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
