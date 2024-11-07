import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDb();
    const { slug } = params;

    const article = await db.get('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    const comments = await db.all(`
      SELECT 
        c.id, c.body, c.created_at as createdAt, c.updated_at as updatedAt,
        u.username, u.bio, u.image
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at DESC
    `, [article.id]);

    const currentUser = await getUser();
    const commentsWithAuthor = await Promise.all(
      comments.map(async (comment: any) => {
        let following = false;
        if (currentUser) {
          const follow = await db.get(
            'SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = (SELECT id FROM users WHERE username = ?)',
            [currentUser.id, comment.username]
          );
          following = !!follow;
        }

        return {
          id: comment.id,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          body: comment.body,
          author: {
            username: comment.username,
            bio: comment.bio,
            image: comment.image,
            following
          }
        };
      })
    );

    return new NextResponse(
      JSON.stringify({ comments: commentsWithAuthor })
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get comments'] } }),
      { status: 422 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const { slug } = params;
    const { comment } = await request.json();

    if (!comment.body) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Comment body is required'] } }),
        { status: 422 }
      );
    }

    const article = await db.get('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    const result = await db.run(
      'INSERT INTO comments (body, article_id, author_id) VALUES (?, ?, ?)',
      [comment.body, article.id, currentUser.id]
    );

    const createdComment = await db.get(`
      SELECT 
        c.id, c.body, c.created_at as createdAt, c.updated_at as updatedAt,
        u.username, u.bio, u.image
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    return new NextResponse(
      JSON.stringify({
        comment: {
          id: createdComment.id,
          createdAt: createdComment.createdAt,
          updatedAt: createdComment.updatedAt,
          body: createdComment.body,
          author: {
            username: createdComment.username,
            bio: createdComment.bio,
            image: createdComment.image,
            following: false
          }
        }
      }),
      { status: 201 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not create comment'] } }),
      { status: 422 }
    );
  }
} 