import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;

  console.log('Pending API called for slug:', slug);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log('User ID from auth:', userId);

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sanityUserId = sanityUser._id;

  console.log('Sanity user ID:', sanityUserId);

  // Fetch community with members and approvalQueue using adminClient for fresh data
  const community = await adminClient.fetch(
    `*[_type == "subreddit" && (slug.current == $slug || title == $title)][0]{
      _id,
      members[]{user->{_id, username, clerkId}, role, status},
      approvalQueue[]{user->{_id, username, clerkId, imageUrl}, requestedAt}
    }`,
    { slug, title: slug }
  );
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  console.log('Community found:', community._id);
  console.log('Community members count:', community.members?.length || 0);
  console.log('Approval queue count:', community.approvalQueue?.length || 0);
  console.log('Raw community data:', JSON.stringify(community, null, 2));
  console.log('Approval queue details:', JSON.stringify(community.approvalQueue, null, 2));

  // Check if current user is owner or moderator
  const isMod = community.members?.some(
    (m: any) => m.user && m.user._id === sanityUserId && ["owner", "moderator"].includes(m.role)
  );
  console.log('Is moderator:', isMod);
  if (!isMod) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Return approvalQueue with user info
  const result = { pending: community.approvalQueue || [] };
  console.log('Returning pending count:', result.pending.length);
  
  const response = NextResponse.json(result);
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
} 