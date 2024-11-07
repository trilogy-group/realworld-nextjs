import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ errors: { body: ['Authorization required'] } }),
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDb();
    
    const articles = await db.all(`
      SELECT 
        a.*, u.username, u.bio, u.image,
        GROUP_CONCAT(t.name) as tagList,
        COUNT(DISTINCT f.user_id) as favoritesCount
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN follows fw ON fw.followed_id = a.author_id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      LEFT JOIN favorites f ON a.id = f.article_id
      WHERE fw.follower_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [currentUser.id, limit, offset]);

    const total = await db.get(`
      SELECT COUNT(DISTINCT a.id) as count
      FROM articles a
      JOIN follows fw ON fw.followed_id = a.author_id
      WHERE fw.follower_id = ?
    `, [currentUser.id]);

    const articlesWithFavorited = await Promise.all(
      articles.map(async (article: any) => {
        const favorite = await db.get(
          'SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?',
          [currentUser.id, article.id]
        );

        return {
          ...article,
          tagList: article.tagList ? article.tagList.split(',') : [],
          favorited: !!favorite,
          author: {
            username: article.username,
            bio: article.bio,
            image: article.image,
            following: true
          }
        };
      })
    );

    return new NextResponse(JSON.stringify({
      articles: articlesWithFavorited,
      articlesCount: total.count
    }));
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get feed'] } }),
      { status: 422 }
    );
  }
} 