import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ethers } from 'ethers'

// POST /api/blockchain/sync — sync blockchain events to database
export async function POST(req: NextRequest) {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC
    const contractAddress = process.env.NEXT_PUBLIC_LAND_SHARES_CONTRACT

    if (!rpcUrl || !contractAddress || contractAddress.startsWith('0x_')) {
      return NextResponse.json(
        { message: 'Blockchain not configured, skipping sync' },
        { status: 200 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(
      contractAddress,
      [
        'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
      ],
      provider
    )

    // Get recent events (last 1000 blocks)
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 1000)

    const events = await contract.queryFilter(
      contract.filters.TransferSingle(),
      fromBlock,
      currentBlock
    )

    const processed = []
    for (const event of events) {
      const log = event as ethers.EventLog
      if (log.args) {
        processed.push({
          from: log.args[1],
          to: log.args[2],
          tokenId: log.args[3].toString(),
          value: log.args[4].toString(),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })
      }
    }

    return NextResponse.json({
      synced: processed.length,
      events: processed,
      fromBlock,
      toBlock: currentBlock,
    })
  } catch (error) {
    console.error('Blockchain sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}
