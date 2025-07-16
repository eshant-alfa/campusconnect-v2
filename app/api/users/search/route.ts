import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) {
      return NextResponse.json({ users: [] });
    }
    // Find the current user's clerkId in Sanity
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, clerkId}`,
      { clerkId: userId }
    );
    if (!currentUser) {
      return NextResponse.json({ users: [] });
    }
    // Search for users by username (case-insensitive, partial match), allow searching for yourself, limit 20
    const users = await client.fetch(
      `*[_type == "user" &&
        username match $q
      ][0...20]{
        _id,
        name,
        username,
        profileImage,
        clerkId
      }`,
      { q: `*${q}*` }
    );
    return NextResponse.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
} 