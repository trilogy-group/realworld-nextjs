import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    
    const tags = await db.all(`
      SELECT DISTINCT name 
      FROM tags 
      ORDER BY name ASC
    `);

    return new NextResponse(
      JSON.stringify({
        tags: tags.map(tag => tag.name)
      })
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errors: { body: ['Could not get tags'] } }),
      { status: 422 }
    );
  }
} 