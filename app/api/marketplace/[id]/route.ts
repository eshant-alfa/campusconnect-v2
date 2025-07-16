import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET /api/marketplace/[id] - Get single item
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await client.fetch(
      `*[_type == "marketplaceItem" && _id == $id][0]{
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
      { id }
    );
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

// PUT /api/marketplace/[id] - Edit item (owner only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { title, description, price, category, condition, images } = body;
    // Find item and check ownership
    const item = await client.fetch(`*[_type == "marketplaceItem" && _id == $id][0]{_id, seller->{clerkId}}`, { id });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (item.seller?.clerkId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // Update
    const now = new Date().toISOString();
    const updated = await adminClient.patch(id)
      .set({
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        images,
        updatedAt: now,
      })
      .commit();
    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/marketplace/[id] - Delete item (owner only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    // Find item and check ownership
    const item = await client.fetch(`*[_type == "marketplaceItem" && _id == $id][0]{_id, seller->{clerkId}}`, { id });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (item.seller?.clerkId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await adminClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 