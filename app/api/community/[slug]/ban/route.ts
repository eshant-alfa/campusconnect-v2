import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { adminClient } from "@/sanity/lib/adminClient";

export async function POST(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userToBan } = await req.json();

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sanityUserId = sanityUser._id;

  const community = await client.fetch(
    `*[_type == "subreddit" && (slug.current == $slug || title == $title)][0]{_id, members, approvalQueue, bannedUsers}`,
    { slug, title: slug }
  );
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  const mod = community.members?.find(
    (m: any) => m.user && m.user._ref === sanityUserId && ["owner", "moderator"].includes(m.role)
  );
  if (!mod) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Remove from members
  const memberIdx = community.members?.findIndex((m: any) => m.user && m.user._ref === userToBan);
  // Remove from approvalQueue
  const queueIdx = community.approvalQueue?.findIndex((q: any) => q.user && q.user._ref === userToBan);

  let patch = adminClient.patch(community._id);
  if (memberIdx !== -1 && memberIdx !== undefined) patch = patch.unset([`members[${memberIdx}]`]);
  if (queueIdx !== -1 && queueIdx !== undefined) patch = patch.unset([`approvalQueue[${queueIdx}]`]);
  patch = patch.insert("after", "bannedUsers[-1]", [
    { _type: "reference", _ref: userToBan },
  ]);
  await patch.commit();

  return NextResponse.json({ success: true });
} 