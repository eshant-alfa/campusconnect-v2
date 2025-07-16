import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { conversationId, content } = body;
    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Find sender's Sanity user
    const sender = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username, profileImage}`,
      { clerkId: userId }
    );
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    const contentToModerate = content.trim();

    // BASIC KEYWORD FILTER ONLY for messages (no AI moderation to save credits)
    const blockedWords = ["hate", "idiot", "stupid", "dumb", "kill", "racist", "sexist", "nazi", "terrorist", "violence", "abuse"];
    if (blockedWords.some(word => contentToModerate.toLowerCase().includes(word))) {
      await adminClient.create({
        _type: "flaggedContent",
        content: contentToModerate,
        user: { _type: "reference", _ref: sender._id },
        type: "message",
        reason: "Blocked by keyword filter",
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Your message was blocked for inappropriate language." }, { status: 400 });
    }

    // Fetch conversation and verify sender is a participant
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $id][0]{
        _id,
        participants[]->{_id, clerkId, name, username, profileImage}
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
    // Save message
    const now = new Date().toISOString();
    const message = await adminClient.create({
      _type: 'message',
      conversation: { _type: 'reference', _ref: conversationId },
      sender: { _type: 'reference', _ref: sender._id },
      content: contentToModerate,
      sentAt: now,
      isRead: false,
    });
    // Update conversation
    await adminClient.patch(conversationId)
      .set({ lastMessage: contentToModerate, updatedAt: now })
      .commit();
    // Trigger Pusher event to conversation channel
    await pusherServer.trigger(`conversation-${conversationId}`, 'new-message', {
      message,
      sender,
    });

    // Notify the recipient
    const recipient = conversation.participants.find((p: any) => p.clerkId && p.clerkId !== userId);
    if (recipient) {
      await pusherServer.trigger(`user-${recipient.clerkId}`, 'new-message', {
        message,
        sender,
        conversationId,
      });
    }

    return NextResponse.json({ message, sender });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
} 