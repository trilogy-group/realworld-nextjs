import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
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
    const { slug, id } = params;

    const article = await db.get('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    const comment = await db.get(
      'SELECT * FROM comments WHERE id = ? AND article_id = ? AND author_id = ?',
      [id, article.id, currentUser.id]
    );

    if (!comment) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Comment not found or unauthorized'] } }),
        { status: 404 }
      );
    }

    await db.run('DELETE FROM comments WHERE id = ?', [id]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not delete comment'] } }),
      { status: 422 }
    );
  }
} 