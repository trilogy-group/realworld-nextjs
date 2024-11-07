import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  // List of paths that require authentication
  const protectedPaths = [
    '/api/user',
    '/api/articles/feed',
    '/api/profiles',
    '/api/articles',
    '/api/articles/create',
    '/editor'
  ]

  const path = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some(prefix => path.startsWith(prefix))

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  const token = request.headers.get('Authorization')?.split('Token ')[1]

  if (!token) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Authorization required'] } }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Invalid token'] } }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return NextResponse.next()
} 