// app/api/community/[slug]/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";

export async function POST(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  // ✅ FIX
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userToApproveId } = await req.json();
  if (!userToApproveId) {
    return NextResponse.json({ error: "Missing userToApproveId" }, { status: 400 });
  }

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == 'user' && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sanityUserId = sanityUser._id;

  // Fetch community
  const community = await adminClient.fetch(
    `*[_type == 'subreddit' && (slug.current == $slug || title == $title)][0]{
      _id,
      members[]{user->{_id}, role, status},
      approvalQueue[]{user->{_id, clerkId, username, email, imageUrl}, requestedAt}
    }`,
    { slug, title: slug }
  );
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  console.log('Approve - Community found:', community._id);
  console.log('Approve - Current approval queue count:', community.approvalQueue?.length || 0);
  console.log('Approve - User to approve ID:', userToApproveId);

  // Check if current user is owner/mod
  const isMod = community.members?.some(
    (m: any) => m.user && m.user._id === sanityUserId && ["owner", "moderator"].includes(m.role)
  );
  if (!isMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove from approvalQueue
  console.log('Approve - Original approval queue:', community.approvalQueue);
  const newApprovalQueue = (community.approvalQueue || []).filter((q: any) => {
    console.log('Approve - Checking queue item:', q, 'against userToApproveId:', userToApproveId);
    return q.user._id !== userToApproveId;
  });
  console.log('Approve - New approval queue count:', newApprovalQueue.length);
  console.log('Approve - New approval queue:', newApprovalQueue);

  // Add to members
  const newMember = {
    user: { _type: "reference", _ref: userToApproveId },
    role: "member",
    status: "active",
    joinedAt: new Date().toISOString(),
  };

  console.log('Approve - Adding new member:', newMember);

  await adminClient
    .patch(community._id)
    .set({ approvalQueue: newApprovalQueue })
    .insert("after", "members[-1]", [newMember])
    .commit();

  console.log('Approve - Successfully updated community');

  // Verify the update was successful
  const updatedCommunity = await adminClient.fetch(
    `*[_type == 'subreddit' && _id == $id][0]{
      _id,
      approvalQueue[]{user->{_id, username, clerkId, email, imageUrl}, requestedAt}
    }`,
    { id: community._id }
  );
  console.log('Approve - Verification - Updated approval queue count:', updatedCommunity.approvalQueue?.length || 0);
  console.log('Approve - Verification - Updated approval queue:', updatedCommunity.approvalQueue);

  // Notify the approved user
  const approvedUser = community.approvalQueue?.find((q: any) => q.user._id === userToApproveId);
  if (approvedUser && approvedUser.user.clerkId) {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userClerkId: approvedUser.user.clerkId,
        type: 'community_approved',
        content: 'Your request to join the community was approved',
        relatedId: community._id,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
