import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userClerkId, type, content, relatedId } = body;
    if (!userClerkId || !type || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Find user in Sanity
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, clerkId, name, username, profileImage}`,
      { clerkId: userClerkId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Create notification
    const now = new Date().toISOString();
    const notification = await adminClient.create({
      _type: 'notification',
      user: { _type: 'reference', _ref: user._id },
      type,
      content,
      relatedId: relatedId || '',
      isRead: false,
      createdAt: now,
    });
    // Trigger Pusher event to user channel
    await pusherServer.trigger(`user-${userClerkId}`, 'new-notification', {
      notification,
    });
    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
} 