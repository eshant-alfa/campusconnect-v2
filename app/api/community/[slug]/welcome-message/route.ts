import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getSubredditBySlug } from '@/sanity/lib/subreddit/getSubredditBySlug';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET: Fetch the welcome message for a community
export async function GET(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;
  
  try {
    const subreddit = await getSubredditBySlug(slug);
    if (!subreddit) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }
    return NextResponse.json({ welcomeMessage: subreddit.welcomeMessage || '' });
  } catch (error) {
    console.error('Error fetching welcome message:', error);
    return NextResponse.json({ error: 'Failed to fetch welcome message' }, { status: 500 });
  }
}

// PUT: Set or update the welcome message for a community
export async function PUT(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Sanity user by Clerk ID
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    if (!sanityUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sanityUserId = sanityUser._id;

    const subreddit = await getSubredditBySlug(slug);
    if (!subreddit) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is owner or moderator
    const isMod = subreddit.members?.some(
      (m: any) => m.user && m.user._ref === sanityUserId && ["owner", "moderator"].includes(m.role)
    );
    if (!isMod) {
      return NextResponse.json({ error: 'Forbidden - Only owners and moderators can edit welcome message' }, { status: 403 });
    }

    const { message } = await req.json();
    if (typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required and must be a string' }, { status: 400 });
    }

    console.log('Updating welcome message for community:', slug);
    console.log('New message:', message);

    const updated = await adminClient.patch(subreddit._id)
      .set({ welcomeMessage: message })
      .commit();

    console.log('Welcome message updated successfully');

    return NextResponse.json({ 
      success: true, 
      welcomeMessage: updated.welcomeMessage 
    });
  } catch (error) {
    console.error('Error updating welcome message:', error);
    return NextResponse.json({ 
      error: 'Failed to update welcome message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 