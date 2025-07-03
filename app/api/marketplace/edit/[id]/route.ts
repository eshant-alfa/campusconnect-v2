import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const itemId = params.id;
    const item = await adminClient.fetch(
      '*[_type == "marketplaceItem" && _id == $id][0]{ _id, seller->{_id} }',
      { id: itemId }
    );
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    if (item.seller?._id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    const data = await req.json();
    const patch: Record<string, any> = {};
    if (data.title) patch.title = data.title;
    if (data.description) patch.description = data.description;
    if (data.price) patch.price = data.price;
    if (data.category) patch.category = data.category;
    if (data.condition) patch.condition = data.condition;
    if (data.status) patch.status = data.status;

    const updated = await adminClient.patch(itemId).set(patch).commit();
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const itemId = params.id;
    const item = await adminClient.fetch(
      '*[_type == "marketplaceItem" && _id == $id][0]{ _id, seller->{_id} }',
      { id: itemId }
    );
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    if (item.seller?._id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }
    await adminClient.delete(itemId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 