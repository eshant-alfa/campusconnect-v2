import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 });
    }
    // Find user's Sanity ID
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Fetch notification and verify ownership
    const notification = await client.fetch(
      `*[_type == "notification" && _id == $id][0]{_id, user->{_id}}`,
      { id }
    );
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    if (notification.user._id !== user._id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Patch notification to set isRead: true
    const updated = await adminClient.patch(id).set({ isRead: true }).commit();
    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
} 