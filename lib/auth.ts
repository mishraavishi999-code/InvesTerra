import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'investerra-dev-secret'

// ─── Password Utilities ──────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT Utilities ───────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// ─── Request Auth Helper ─────────────────────────────────────────────────────

export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

// ─── Wallet Signature Verification ──────────────────────────────────────────

export function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recovered = ethers.verifyMessage(message, signature)
    return recovered.toLowerCase() === expectedAddress.toLowerCase()
  } catch {
    return false
  }
}

// ─── Generate Nonce for Wallet Auth ─────────────────────────────────────────

export function generateNonce(): string {
  return `Sign this message to login to InvesTerra.\nNonce: ${Date.now()}-${Math.random().toString(36).slice(2)}`
}
