import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

// GET /api/marketplace/user/[userId] - Get all items for a user
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const items = await client.fetch(
      `*[_type == "marketplaceItem" && seller->clerkId == $userId]{
        _id,
        title,
        description,
        price,
        category,
        condition,
        images,
        createdAt,
        updatedAt
      }`,
      { userId }
    );
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user items' }, { status: 500 });
  }
} 