import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/app/lib/db'
import { hashPassword, createToken } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body.user

    if (!username || !email || !password) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['Username, email and password are required'] },
        }),
        { status: 422 }
      )
    }

    const db = await getDb()
    
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['User already exists'] },
        }),
        { status: 422 }
      )
    }

    const hashedPassword = await hashPassword(password)
    
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )

    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID])
    const token = await createToken({ id: user.id, username: user.username })

    return new NextResponse(
      JSON.stringify({
        user: {
          email: user.email,
          token,
          username: user.username,
          bio: user.bio || null,
          image: user.image || null,
        },
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not create user'] } }),
      { status: 422 }
    )
  }
} 