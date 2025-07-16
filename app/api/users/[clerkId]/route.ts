// app/api/users/[clerkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(
  request: NextRequest,
  context: { params: { clerkId: string } }
) {
  // ✅ FIX: await context.params
  const { clerkId } = await context.params;

  if (!clerkId) {
    return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
  }

  try {
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{
        _id,
        username,
        imageUrl,
        email
      }`,
      { clerkId }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Return *only* the safe public fields you want on frontend
    return NextResponse.json({
      _id: user._id,
      username: user.username,
      imageUrl: user.imageUrl,
      email: user.email
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
