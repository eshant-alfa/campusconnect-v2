import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET /api/marketplace - List all active marketplace items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    let filter = `_type == "marketplaceItem" && isActive == true`;
    const params: Record<string, any> = {};
    if (category) {
      filter += ` && category == $category`;
      params.category = category;
    }
    if (q) {
      filter += ` && (title match $q || description match $q)`;
      params.q = `*${q}*`;
    }
    const items = await client.fetch(
      `*[${filter}]{
        _id,
        title,
        description,
        price,
        category,
        condition,
        images,
        seller->{_id, username, clerkId, imageUrl},
        createdAt,
        updatedAt
      }`,
      params
    );
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marketplace items' }, { status: 500 });
  }
}

// POST /api/marketplace - Create a new marketplace item
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, price, category, condition, images } = body;
    if (!title || !description || !price || !category || !condition || !images || images.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Find user in Sanity
    const user = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username}`,
      { clerkId: userId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Create item (no status field needed)
    const now = new Date().toISOString();
    const item = await adminClient.create({
      _type: 'marketplaceItem',
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images,
      seller: { _type: 'reference', _ref: user._id },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create marketplace item' }, { status: 500 });
  }
} 