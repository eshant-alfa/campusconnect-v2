import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';
import { runAllModerationChecks } from '@/lib/openaiModeration';

// GET /api/events/[id]/comments — List comments for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const query = `*[_type == "eventComment" && event._ref == $id] | order(createdAt asc) {
    _id,
    content,
    createdAt,
    user->{_id, username, clerkId},
    parentComment->{_id, content, user->{_id, username, clerkId}},
  }`;

  const comments = await adminClient.fetch(query, { id });
  return NextResponse.json({ comments });
}

// POST /api/events/[id]/comments — Add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const data = await req.json();
  if (!data.content || typeof data.content !== 'string' || !data.content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    // First, get the Sanity user ID for the current Clerk user
    const sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username}`,
      { clerkId: userId }
    );

    if (!sanityUser || !sanityUser._id) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Verify the event exists
    const event = await adminClient.fetch(
      `*[_type == "event" && _id == $id][0]{_id}`,
      { id }
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const contentToModerate = data.content.trim();

    // AI MODERATION
    const moderationResult = await runAllModerationChecks(contentToModerate, "comment");
    if (moderationResult.flagged) {
      await adminClient.create({
        _type: "flaggedContent",
        content: contentToModerate,
        user: { _type: "reference", _ref: sanityUser._id },
        type: "eventComment",
        reason: moderationResult.reason + ` (via ${moderationResult.method})`,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ 
        error: `Comment blocked: ${moderationResult.reason}` 
      }, { status: 400 });
    }

    // Log if AI moderation is unavailable
    if (!moderationResult.aiAvailable) {
      console.warn(`Event comment created with basic moderation only (AI unavailable) - User: ${sanityUser.username || sanityUser.name}, Content: ${contentToModerate.substring(0, 100)}...`);
    }

    const newComment = await adminClient.create({
      _type: 'eventComment',
      content: contentToModerate,
      event: { _type: 'reference', _ref: id },
      user: { _type: 'reference', _ref: sanityUser._id },
      createdAt: new Date().toISOString(),
      parentComment: data.parentComment ? { _type: 'reference', _ref: data.parentComment } : undefined,
    });
    
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (err) {
    console.error('Add comment error:', err);
    return NextResponse.json({ 
      error: 'Failed to add comment', 
      details: String(err) 
    }, { status: 500 });
  }
}
