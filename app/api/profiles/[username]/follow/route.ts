import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Authorization required'] } }),
        { status: 401 }
      );
    }

    const db = await getDb();
    const username = params.username;

    const userToFollow = await db.get(
      'SELECT id, username, bio, image FROM users WHERE username = ?',
      [username]
    );

    if (!userToFollow) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['User not found'] } }),
        { status: 404 }
      );
    }

    await db.run(
      'INSERT OR IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)',
      [currentUser.id, userToFollow.id]
    );

    return new NextResponse(
      JSON.stringify({
        profile: {
          username: userToFollow.username,
          bio: userToFollow.bio || null,
          image: userToFollow.image || null,
          following: true
        }
      })
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not follow user'] } }),
      { status: 422 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Authorization required'] } }),
        { status: 401 }
      );
    }

    const db = await getDb();
    const username = params.username;

    const userToUnfollow = await db.get(
      'SELECT id, username, bio, image FROM users WHERE username = ?',
      [username]
    );

    if (!userToUnfollow) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['User not found'] } }),
        { status: 404 }
      );
    }

    await db.run(
      'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
      [currentUser.id, userToUnfollow.id]
    );

    return new NextResponse(
      JSON.stringify({
        profile: {
          username: userToUnfollow.username,
          bio: userToUnfollow.bio || null,
          image: userToUnfollow.image || null,
          following: false
        }
      })
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not unfollow user'] } }),
      { status: 422 }
    );
  }
} 