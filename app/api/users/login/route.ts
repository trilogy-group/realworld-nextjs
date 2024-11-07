import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/app/lib/db'
import { comparePasswords, createToken } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body.user

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['Email and password are required'] },
        }),
        { status: 422 }
      )
    }

    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['Invalid email or password'] },
        }),
        { status: 401 }
      )
    }

    const isValid = await comparePasswords(password, user.password_hash)
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['Invalid email or password'] },
        }),
        { status: 401 }
      )
    }

    const token = await createToken({ id: user.id, username: user.username })

    // Set cookie for server-side auth
    const response = new NextResponse(
      JSON.stringify({
        user: {
          email: user.email,
          token,
          username: user.username,
          bio: user.bio || null,
          image: user.image || null,
        },
      }),
      { status: 200 }
    )

    // Set the token cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not authenticate'] } }),
      { status: 422 }
    )
  }
} 