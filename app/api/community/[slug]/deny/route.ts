import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";

export async function POST(req: NextRequest, context: { params: { slug: string } }) {
  const { slug } = context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { userToDenyId } = await req.json();
  if (!userToDenyId) return NextResponse.json({ error: "Missing userToDenyId" }, { status: 400 });

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == 'user' && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  // Check if current user is owner/mod
  const isMod = community.members?.some(
    (m: any) => m.user && m.user._id === sanityUserId && ["owner", "moderator"].includes(m.role)
  );
  if (!isMod) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Remove from approvalQueue
  const newApprovalQueue = (community.approvalQueue || []).filter((q: any) => q.user._id !== userToDenyId);
  await adminClient.patch(community._id)
    .set({ approvalQueue: newApprovalQueue })
    .commit();

  // Notify the user
  const deniedUser = community.approvalQueue.find((q: any) => q.user._id === userToDenyId);
  if (deniedUser && deniedUser.user.clerkId) {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userClerkId: deniedUser.user.clerkId,
        type: 'community_denied',
        content: 'Your request to join the community was denied',
        relatedId: community._id,
      }),
    });
  }

  return NextResponse.json({ success: true });
} 