import { NextRequest } from 'next/server';
import { getSubredditBySlug } from '@/sanity/lib/subreddit/getSubredditBySlug';
import { adminClient } from '@/sanity/lib/adminClient';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch moderation logs for a community
export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  const { params } = await context;
  const { slug } = params;
  try {
    const subreddit = await getSubredditBySlug(slug);
    if (!subreddit) {
      return new Response(JSON.stringify({ error: 'Community not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ modLogs: subreddit.modLogs || [] }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch moderation logs' }), { status: 500 });
  }
}

// POST: Add a new moderation log entry
export async function POST(req: NextRequest, context: { params: { slug: string } }) {
  const { params } = await context;
  const { slug } = params;
  try {
    const subreddit = await getSubredditBySlug(slug);
    if (!subreddit) {
      return new Response(JSON.stringify({ error: 'Community not found' }), { status: 404 });
    }
    const { actionType, mod, targetUser, targetPost, reason } = await req.json();
    if (!actionType || !mod) {
      return new Response(JSON.stringify({ error: 'actionType and mod are required' }), { status: 400 });
    }
    const modActionId = `modAction.${uuidv4()}`;
    // Create the modAction document
    await adminClient.create({
      _id: modActionId,
      _type: 'modAction',
      actionType,
      mod: { _type: 'reference', _ref: mod },
      targetUser: targetUser ? { _type: 'reference', _ref: targetUser } : undefined,
      targetPost: targetPost ? { _type: 'reference', _ref: targetPost } : undefined,
      reason: reason || '',
      createdAt: new Date().toISOString(),
    });
    // Append the modAction reference to the community's modLogs
    const updated = await adminClient.patch(subreddit._id)
      .setIfMissing({ modLogs: [] })
      .append('modLogs', [{ _type: 'reference', _ref: modActionId }])
      .commit();
    return new Response(JSON.stringify({ modLogs: updated.modLogs }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add moderation log' }), { status: 500 });
  }
} 