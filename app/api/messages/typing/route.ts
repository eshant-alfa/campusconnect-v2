import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, action } = await request.json();
    
    if (!conversationId || !action) {
      return NextResponse.json({ error: 'Missing conversationId or action' }, { status: 400 });
    }

    // Emit typing event to Pusher
    await pusherServer.trigger(`conversation-${conversationId}`, `typing-${action}`, {
      userId,
      conversationId,
      action
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing indicator error:', error);
    return NextResponse.json({ error: 'Failed to send typing indicator' }, { status: 500 });
  }
} 