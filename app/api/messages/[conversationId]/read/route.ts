import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

export async function POST(request: NextRequest, context: { params: { conversationId: string } }) {
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

    // Verify user is a participant in the conversation
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

    // Mark all unread messages in this conversation as read
    const unreadMessages = await client.fetch(
      `*[_type == "message" && conversation._ref == $conversationId && isRead == false && sender._ref != $userId]{
        _id
      }`,
      { conversationId, userId: user._id }
    );

    // Update all unread messages
    for (const message of unreadMessages) {
      await adminClient.patch(message._id)
        .set({ isRead: true })
        .commit();
    }

    return NextResponse.json({ 
      success: true, 
      markedAsRead: unreadMessages.length 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
} 