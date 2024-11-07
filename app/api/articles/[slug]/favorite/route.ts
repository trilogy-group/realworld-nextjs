import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

async function getArticleResponse(db: any, slug: string, currentUser: any) {
  const article = await db.get(`
    SELECT articles.*, users.username, users.bio, users.image,
    (SELECT COUNT(*) FROM favorites WHERE article_id = articles.id) as favoritesCount,
    EXISTS(SELECT 1 FROM favorites WHERE article_id = articles.id AND user_id = ?) as favorited
    FROM articles
    LEFT JOIN users ON articles.author_id = users.id
    WHERE slug = ?
  `, [currentUser.id, slug]);

  if (!article) return null;

  return {
    article: {
      ...article,
      favorited: Boolean(article.favorited),
      author: {
        username: article.username,
        bio: article.bio,
        image: article.image,
      }
    }
  };
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

    const article = await db.get('SELECT * FROM articles WHERE slug = ?', [slug]);
    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    await db.run(
      'INSERT OR IGNORE INTO favorites (user_id, article_id) VALUES (?, ?)',
      [currentUser.id, article.id]
    );

    const response = await getArticleResponse(db, slug, currentUser);
    return NextResponse.json(response);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not favorite article'] } }),
      { status: 422 }
    );
  }
}

export async function DELETE(
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

    const article = await db.get('SELECT * FROM articles WHERE slug = ?', [slug]);
    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    await db.run(
      'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
      [currentUser.id, article.id]
    );

    const response = await getArticleResponse(db, slug, currentUser);
    return NextResponse.json(response);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not unfavorite article'] } }),
      { status: 422 }
    );
  }
} 