import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const db = await getDb();
    const currentUser = await getUser();
    const username = params.username;

    const user = await db.get(
      'SELECT id, username, bio, image FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['User not found'] } }),
        { status: 404 }
      );
    }

    let following = false;
    if (currentUser) {
      const follow = await db.get(
        'SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?',
        [currentUser.id, user.id]
      );
      following = !!follow;
    }

    return new NextResponse(
      JSON.stringify({
        profile: {
          username: user.username,
          bio: user.bio || null,
          image: user.image || null,
          following
        }
      })
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get profile'] } }),
      { status: 422 }
    );
  }
} 