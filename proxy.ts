import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/profile', '/kyc', '/admin', '/marketplace/sell']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path needs protection
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // In a JWT-only setup, actual auth check happens client-side
  // Middleware just ensures the page exists and allows the request
  // Auth guards are in the page components themselves
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/kyc/:path*', '/admin/:path*', '/marketplace/sell/:path*'],
}
