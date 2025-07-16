import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getSubredditBySlug } from '@/sanity/lib/subreddit/getSubredditBySlug';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET: Fetch all rules for a community
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
    return NextResponse.json({ rules: subreddit.rules || [] });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST: Add a new rule to the community
export async function POST(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
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
      return NextResponse.json({ error: 'Forbidden - Only owners and moderators can add rules' }, { status: 403 });
    }

    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    console.log('Adding new rule for community:', slug);
    console.log('Rule title:', title);

    const newRule = { title, description, _key: `rule_${Date.now()}` };
    const updated = await adminClient.patch(subreddit._id)
      .setIfMissing({ rules: [] })
      .append('rules', [newRule])
      .commit();

    console.log('Rule added successfully');

    return NextResponse.json({ rules: updated.rules }, { status: 201 });
  } catch (error) {
    console.error('Error adding rule:', error);
    return NextResponse.json({ 
      error: 'Failed to add rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT: Update a rule in the community
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
      return NextResponse.json({ error: 'Forbidden - Only owners and moderators can edit rules' }, { status: 403 });
    }

    const { ruleIndex, title, description } = await req.json();
    if (typeof ruleIndex !== 'number' || !title || !description) {
      return NextResponse.json({ error: 'ruleIndex, title, and description are required' }, { status: 400 });
    }
    const rules = subreddit.rules || [];
    if (ruleIndex < 0 || ruleIndex >= rules.length) {
      return NextResponse.json({ error: 'Invalid rule index' }, { status: 400 });
    }

    console.log('Updating rule for community:', slug);
    console.log('Rule index:', ruleIndex);
    console.log('New title:', title);

    rules[ruleIndex] = { ...rules[ruleIndex], title, description };
    const updated = await adminClient.patch(subreddit._id)
      .set({ rules })
      .commit();

    console.log('Rule updated successfully');

    return NextResponse.json({ rules: updated.rules });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ 
      error: 'Failed to update rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Remove a rule from the community
export async function DELETE(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
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
      return NextResponse.json({ error: 'Forbidden - Only owners and moderators can delete rules' }, { status: 403 });
    }

    const { ruleIndex } = await req.json();
    const rules = subreddit.rules || [];
    if (typeof ruleIndex !== 'number' || ruleIndex < 0 || ruleIndex >= rules.length) {
      return NextResponse.json({ error: 'Invalid rule index' }, { status: 400 });
    }

    console.log('Deleting rule for community:', slug);
    console.log('Rule index:', ruleIndex);

    rules.splice(ruleIndex, 1);
    const updated = await adminClient.patch(subreddit._id)
      .set({ rules })
      .commit();

    console.log('Rule deleted successfully');

    return NextResponse.json({ rules: updated.rules });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json({ 
      error: 'Failed to delete rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 