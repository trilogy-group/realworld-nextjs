import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const favorited = searchParams.get('favorited');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDb();
    const currentUser = await getUser();

    let query = `
      SELECT 
        a.id, a.slug, a.title, a.description, a.created_at as createdAt, 
        a.updated_at as updatedAt,
        u.username, u.bio, u.image,
        COUNT(DISTINCT f.user_id) as favoritesCount,
        GROUP_CONCAT(DISTINCT t.name) as tagList
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN favorites f ON a.id = f.article_id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (tag) {
      conditions.push('t.name = ?');
      params.push(tag);
    }

    if (author) {
      conditions.push('u.username = ?');
      params.push(author);
    }

    if (favorited) {
      conditions.push('EXISTS (SELECT 1 FROM favorites f2 JOIN users u2 ON f2.user_id = u2.id WHERE f2.article_id = a.id AND u2.username = ?)');
      params.push(favorited);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const articles = await db.all(query, params);
    const total = await db.get('SELECT COUNT(*) as count FROM articles');

    const articlesWithFavorited = await Promise.all(
      articles.map(async (article: any) => {
        let favorited = false;
        if (currentUser) {
          const favorite = await db.get(
            'SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?',
            [currentUser.id, article.id]
          );
          favorited = !!favorite;
        }

        return {
          ...article,
          tagList: article.tagList ? article.tagList.split(',') : [],
          favorited,
          author: {
            username: article.username,
            bio: article.bio,
            image: article.image,
            following: false // TODO: Implement following status
          }
        };
      })
    );

    return new NextResponse(
      JSON.stringify({
        articles: articlesWithFavorited,
        articlesCount: total.count
      })
    );
  } catch (error) {
    console.error('List articles error:', error);
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get articles'] } }),
      { status: 422 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Authorization required'] } }),
        { status: 401 }
      );
    }

    const { article } = await request.json();
    const { title, description, body, tagList = [] } = article;

    if (!title || !description || !body) {
      return new NextResponse(
        JSON.stringify({
          errors: { body: ['Title, description and body are required'] }
        }),
        { status: 422 }
      );
    }

    const db = await getDb();
    const slug = slugify(title, { lower: true });

    const result = await db.run(
      'INSERT INTO articles (slug, title, description, body, author_id) VALUES (?, ?, ?, ?, ?)',
      [slug, title, description, body, currentUser.id]
    );

    // Handle tags
    for (const tagName of tagList) {
      await db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
      const tag = await db.get('SELECT id FROM tags WHERE name = ?', [tagName]);
      await db.run(
        'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
        [result.lastID, tag.id]
      );
    }

    const createdArticle = await db.get(
      `SELECT 
        a.*, u.username, u.bio, u.image,
        GROUP_CONCAT(t.name) as tagList
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.id = ?
      GROUP BY a.id`,
      [result.lastID]
    );

    return new NextResponse(
      JSON.stringify({
        article: {
          ...createdArticle,
          tagList: createdArticle.tagList ? createdArticle.tagList.split(',') : [],
          favorited: false,
          favoritesCount: 0,
          author: {
            username: createdArticle.username,
            bio: createdArticle.bio,
            image: createdArticle.image,
            following: false
          }
        }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create article error:', error);
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not create article'] } }),
      { status: 422 }
    );
  }
} 