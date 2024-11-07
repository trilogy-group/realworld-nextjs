import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import slugify from 'slugify';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDb();
    const currentUser = await getUser();
    const { slug } = params;

    const article = await db.get(`
      SELECT 
        a.*, u.username, u.bio, u.image,
        GROUP_CONCAT(t.name) as tagList,
        COUNT(DISTINCT f.user_id) as favoritesCount
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      LEFT JOIN favorites f ON a.id = f.article_id
      WHERE a.slug = ?
      GROUP BY a.id
    `, [slug]);

    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found'] } }),
        { status: 404 }
      );
    }

    let favorited = false;
    if (currentUser) {
      const favorite = await db.get(
        'SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?',
        [currentUser.id, article.id]
      );
      favorited = !!favorite;
    }

    return new NextResponse(JSON.stringify({
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList ? article.tagList.split(',') : [],
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        favorited,
        favoritesCount: article.favoritesCount,
        author: {
          username: article.username,
          bio: article.bio,
          image: article.image,
          following: false // TODO: Implement following status
        }
      }
    }));
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get article'] } }),
      { status: 422 }
    );
  }
}

export async function PUT(
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
    const { article: updates } = await request.json();

    const existingArticle = await db.get(
      'SELECT * FROM articles WHERE slug = ? AND author_id = ?',
      [slug, currentUser.id]
    );

    if (!existingArticle) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found or unauthorized'] } }),
        { status: 404 }
      );
    }

    const newSlug = updates.title ? slugify(updates.title, { lower: true }) : slug;
    
    await db.run(`
      UPDATE articles 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        body = COALESCE(?, body),
        slug = ?,
        updated_at = DATETIME('now')
      WHERE slug = ?
    `, [updates.title, updates.description, updates.body, newSlug, slug]);

    // Fetch and return updated article
    return await GET(request, { params: { slug: newSlug } });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not update article'] } }),
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

    const article = await db.get(
      'SELECT * FROM articles WHERE slug = ? AND author_id = ?',
      [slug, currentUser.id]
    );

    if (!article) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Article not found or unauthorized'] } }),
        { status: 404 }
      );
    }

    await db.run('DELETE FROM articles WHERE id = ?', [article.id]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not delete article'] } }),
      { status: 422 }
    );
  }
} 