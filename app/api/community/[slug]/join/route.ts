import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

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
      `*[_type == "subreddit" && slug.current == $slug][0]{
        _id,
        name,
        type,
        members[]{
          user->{_id, clerkId},
          role,
          status
        },
        approvalQueue[]{
          user->{_id, clerkId},
          requestedAt
        }
      }`,
      { slug }
    );

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = community.members?.find((member: any) => member && member.user && member.user.clerkId === userId);
    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this community' }, { status: 400 });
    }

    // Check if user is already in approval queue
    const existingRequest = community.approvalQueue?.find((request: any) => request && request.user && request.user.clerkId === userId);
    if (existingRequest) {
      return NextResponse.json({ error: 'Join request already pending approval' }, { status: 400 });
    }

    // Handle different community types
    if (community.type === 'public') {
      // Public communities: join immediately
      const updatedCommunity = await adminClient
        .patch(community._id)
        .append('members', [{
          user: { _type: 'reference', _ref: user._id },
          role: 'member',
          status: 'active',
          joinedAt: new Date().toISOString()
        }])
        .commit();

      return NextResponse.json({ 
        message: `Successfully joined ${community.name}`,
        community: updatedCommunity 
      });
    } else {
      // Restricted or private communities: add to approval queue
      const updatedCommunity = await adminClient
        .patch(community._id)
        .append('approvalQueue', [{
          user: { _type: 'reference', _ref: user._id },
          requestedAt: new Date().toISOString()
        }])
        .commit();

      return NextResponse.json({ 
        message: `Join request submitted for ${community.name}. Waiting for moderator approval.`,
        status: 'pending',
        community: updatedCommunity 
      });
    }
  } catch (error) {
    console.error('Join community error:', error);
    return NextResponse.json({ error: 'Failed to join community' }, { status: 500 });
  }
} 