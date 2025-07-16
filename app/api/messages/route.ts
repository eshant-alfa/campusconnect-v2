import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Find user's Sanity ID
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Fetch all conversations where user is a participant
    const conversations = await client.fetch(
      `*[_type == "conversation" && $userId in participants[]._ref] | order(updatedAt desc){
        _id,
        participants[]->{_id, name, username, profileImage, clerkId},
        lastMessage,
        updatedAt,
        "unreadCount": count(*[_type == "message" && conversation._ref == ^._id && isRead == false && sender._ref != $userId])
      }`,
      { userId: user._id }
    );
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: 'Failed to list conversations' }, { status: 500 });
  }
} 