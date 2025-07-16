import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getMarketplaceItemById } from '@/sanity/lib/marketplace/getMarketplaceItemById';
import { currentUser } from '@clerk/nextjs/server';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const itemId = params.id;
  const item = await getMarketplaceItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: 'Marketplace item not found' }, { status: 404 });
  }

  if (item.seller?._id !== user.id) {
    return NextResponse.json({ error: 'You are not authorized to delete this item' }, { status: 403 });
  }

  try {
    await adminClient.delete(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 