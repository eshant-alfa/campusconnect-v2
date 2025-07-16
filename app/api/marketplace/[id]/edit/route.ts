import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getMarketplaceItemById } from '@/sanity/lib/marketplace/getMarketplaceItemById';
import { currentUser } from '@clerk/nextjs/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const itemId = params.id;
  const item = await getMarketplaceItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: 'Marketplace item not found' }, { status: 404 });
  }

  // FIX: Compare Clerk user ID for ownership
  if (item.seller?.clerkId !== user.id) {
    return NextResponse.json({ error: 'You are not authorized to edit this item' }, { status: 403 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const allowedFields = ['title', 'description', 'price', 'category', 'images'];
  const patchData: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in data) patchData[key] = data[key];
  }

  if (Object.keys(patchData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const result = await adminClient.patch(itemId).set(patchData).commit();
    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
} 