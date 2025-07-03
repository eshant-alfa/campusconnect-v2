import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Pusher from "pusher";
import { adminClient as sanity } from '@/sanity/lib/adminClient';

// Add environment variable check and debug log for Pusher
['PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_CLUSTER'].forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});
console.log('PUSHER ENV:', {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { senderId, recipientId, content } = await req.json();
  console.log('SEND MESSAGE REQUEST:', { senderId, recipientId, content });
  if (!senderId || !recipientId || !content) {
    console.log('SEND MESSAGE ERROR: Missing required fields');
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const messageId = uuidv4();

  // Save message to Sanity
  const messageDoc = {
    _type: "message",
    _id: messageId,
    sender: { _type: "reference", _ref: senderId },
    recipients: [{ _type: "reference", _ref: recipientId }],
    content,
    timestamp,
    readBy: [{ _type: "reference", _ref: senderId }],
  };

  try {
    const sanityResult = await sanity.create(messageDoc);
    console.log('SANITY CREATE RESULT:', sanityResult);

    // Trigger Pusher event for both users
    const pusherChannel = `private-chat-${[senderId, recipientId].sort().join("-")}`;
    const pusherResult = await pusher.trigger(
      pusherChannel,
      "new-message",
      {
        message: {
          ...messageDoc,
          _id: messageId,
        },
      }
    );
    console.log('PUSHER TRIGGER RESULT:', pusherResult);

    return NextResponse.json({ success: true, message: messageDoc });
  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
} 