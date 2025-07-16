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
    
    // Fetch conversation with participant details
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $id][0]{
        _id,
        participants[]->{_id, name, username, profileImage, clerkId},
        lastMessage,
        updatedAt
      }`,
      { id: conversationId }
    );
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Verify user is a participant
    const isParticipant = conversation.participants.some((p: any) => p.clerkId === userId);
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Fetch conversation details error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation details' }, { status: 500 });
  }
} 