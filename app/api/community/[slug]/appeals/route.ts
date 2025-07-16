import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing community slug' }, { status: 400 });
    }

    const appeals = await client.fetch(
      `*[_type == "appeal" && community->slug.current == $slug] | order(createdAt desc) {
        _id,
        reason,
        status,
        createdAt,
        user->{_id, name, username, profileImage}
      }`,
      { slug }
    );

    return NextResponse.json({ appeals });
  } catch (error) {
    console.error('Get appeals error:', error);
    return NextResponse.json({ error: 'Failed to fetch appeals' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing community slug' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Find user in Sanity
    const user = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username}`,
      { clerkId: userId }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find community
    const community = await client.fetch(
      `*[_type == "subreddit" && slug.current == $slug][0]{_id, name}`,
      { slug }
    );

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const appeal = await adminClient.create({
      _type: 'appeal',
      community: { _type: 'reference', _ref: community._id },
      user: { _type: 'reference', _ref: user._id },
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ appeal });
  } catch (error) {
    console.error('Create appeal error:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing community slug' }, { status: 400 });
    }

    const body = await request.json();
    const { appealId, status, moderatorNote } = body;

    if (!appealId || !status) {
      return NextResponse.json({ error: 'Appeal ID and status are required' }, { status: 400 });
    }

    // Verify user is moderator of this community
    const community = await client.fetch(
      `*[_type == "subreddit" && slug.current == $slug]{
        _id,
        moderators[]->{_id, clerkId}
      }[0]`,
      { slug }
    );

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const isModerator = community.moderators.some((mod: any) => mod.clerkId === userId);
    if (!isModerator) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updatedAppeal = await adminClient
      .patch(appealId)
      .set({ 
        status, 
        moderatorNote: moderatorNote?.trim(),
        resolvedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json({ appeal: updatedAppeal });
  } catch (error) {
    console.error('Update appeal error:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
} 