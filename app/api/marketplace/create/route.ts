import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Clerk authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure Sanity user exists
    let sanityUser = await adminClient.fetch(
      '*[_type == "user" && _id == $id][0]', { id: userId }
    );
    if (!sanityUser) {
      sanityUser = await adminClient.createIfNotExists({
        _type: 'user',
        _id: userId,
        username: 'Anonymous', // Optionally fetch from Clerk
      });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const status = formData.get('status') as string;
    const imageFile = formData.get('image') as File | null;

    let imageAsset = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageAsset = await adminClient.assets.upload('image', buffer, {
        filename: imageFile.name,
        contentType: imageFile.type,
      });
    }

    const doc = {
      _type: 'marketplaceItem',
      title,
      description,
      price,
      category,
      condition,
      status,
      seller: { _type: 'reference', _ref: userId },
      image: imageAsset ? { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } : undefined,
      createdAt: new Date().toISOString(),
    };

    const created = await adminClient.create(doc);
    return NextResponse.json({ success: true, item: created });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
  }
} 