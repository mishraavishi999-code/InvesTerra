import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { ethers } from 'ethers'

// POST /api/blockchain/mint — mint land share tokens (admin/system only)
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req)
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { toAddress, tokenId, amount } = await req.json()

    if (!toAddress || tokenId === undefined || !amount) {
      return NextResponse.json(
        { error: 'Address, token ID, and amount required' },
        { status: 400 }
      )
    }

    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC
    const privateKey = process.env.POLYGON_PRIVATE_KEY

    if (!rpcUrl || !privateKey) {
      return NextResponse.json(
        { error: 'Blockchain config missing' },
        { status: 500 }
      )
    }

    const contractAddress = process.env.NEXT_PUBLIC_LAND_SHARES_CONTRACT
    if (!contractAddress || contractAddress.startsWith('0x_')) {
      return NextResponse.json(
        { error: 'Land shares contract not deployed yet' },
        { status: 500 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(
      contractAddress,
      [
        'function mint(address to, uint256 id, uint256 amount, bytes data)',
      ],
      wallet
    )

    const tx = await contract.mint(toAddress, tokenId, amount, '0x')
    const receipt = await tx.wait()

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    })
  } catch (error) {
    console.error('Mint error:', error)
    return NextResponse.json(
      { error: 'Minting failed' },
      { status: 500 }
    )
  }
}
