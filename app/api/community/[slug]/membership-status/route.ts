import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ status: "none" });

  // Fetch Sanity user by Clerk ID
  const sanityUser = await client.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
    { clerkId: userId }
  );
  if (!sanityUser?._id) return NextResponse.json({ status: "none" });
  const sanityUserId = sanityUser._id;

  const community = await client.fetch(
    `*[_type == "subreddit" && (slug.current == $slug || title == $title)][0]{members, approvalQueue}`,
    { slug, title: slug }
  );
  if (!community) return NextResponse.json({ status: "none" });

  // Check if user is an active member
  const member = community.members?.find((m: any) => m.user && m.user._ref === sanityUserId && m.status === "active");
  if (member) return NextResponse.json({ status: "active" });

  // Check if user is in approval queue
  const pending = community.approvalQueue?.find((q: any) => q.user && q.user._ref === sanityUserId);
  if (pending) return NextResponse.json({ status: "pending" });

  // Check if user is a pending member (legacy)
  const pendingMember = community.members?.find((m: any) => m.user && m.user._ref === sanityUserId && m.status === "pending");
  if (pendingMember) return NextResponse.json({ status: "pending" });

  return NextResponse.json({ status: "none" });
} 