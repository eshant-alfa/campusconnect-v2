import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { participantClerkId } = body;
    if (!participantClerkId || participantClerkId === userId) {
      return NextResponse.json({ error: 'Invalid participant' }, { status: 400 });
    }
    // Find both users in Sanity
    const users = await client.fetch(
      `*[_type == "user" && (clerkId == $userA || clerkId == $userB)]{_id, clerkId, name, username, profileImage}`,
      { userA: userId, userB: participantClerkId }
    );
    if (users.length !== 2) {
      return NextResponse.json({ error: 'User(s) not found' }, { status: 404 });
    }
    const userA = users.find((u: any) => u.clerkId === userId);
    const userB = users.find((u: any) => u.clerkId === participantClerkId);
    if (!userA || !userB) {
      return NextResponse.json({ error: 'User(s) not found' }, { status: 404 });
    }
    // Check for existing conversation
    const existing = await client.fetch(
      `*[_type == "conversation" &&
        count(participants[(_ref == $userA || _ref == $userB)]) == 2 &&
        count(participants) == 2
      ][0]`,
      { userA: userA._id, userB: userB._id }
    );
    if (existing) {
      return NextResponse.json({ conversation: existing });
    }
    // Create new conversation
    const now = new Date().toISOString();
    const conversation = await adminClient.create({
      _type: 'conversation',
      participants: [
        { _type: 'reference', _ref: userA._id },
        { _type: 'reference', _ref: userB._id },
      ],
      lastMessage: '',
      updatedAt: now,
    });
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create/find conversation' }, { status: 500 });
  }
} 