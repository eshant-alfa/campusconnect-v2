import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest, context: { params: { conversationId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { conversationId } = await context.params;
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    // Find user's Sanity ID
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Fetch conversation and verify user is a participant
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $id][0]{
        _id,
        participants[]->{_id, clerkId}
      }`,
      { id: conversationId }
    );
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    const isParticipant = conversation.participants.some((p: any) => p.clerkId === userId);
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }
    // Fetch messages in conversation, ordered by sentAt
    const messages = await client.fetch(
      `*[_type == "message" && conversation._ref == $id] | order(sentAt asc){
        _id,
        content,
        sentAt,
        isRead,
        sender->{_id, name, username, profileImage, clerkId}
      }`,
      { id: conversationId }
    );
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
} 