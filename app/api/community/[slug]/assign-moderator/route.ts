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

  const { userToMod } = await req.json();

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sanityUserId = sanityUser._id;

  const community = await client.fetch(
    `*[_type == "subreddit" && slug.current == $slug][0]{_id, members}`,
    { slug }
  );
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  const owner = community.members?.find(
    (m: any) => m.user && m.user._ref === sanityUserId && m.role === "owner"
  );
  if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const memberIdx = community.members?.findIndex((m: any) => m.user && m.user._ref === userToMod && m.status === "active");
  if (memberIdx === -1 || memberIdx === undefined)
    return NextResponse.json({ error: "Not an active member" }, { status: 400 });

  await adminClient
    .patch(community._id)
    .set({ [`members[${memberIdx}].role`]: "moderator" })
    .commit();

  return NextResponse.json({ success: true });
} 