import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function GET(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;

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

  const member = community.members?.find((m: any) => m.user && m.user._ref === sanityUserId && m.status === "active");
  if (member) return NextResponse.json({ status: "active" });

  const pending = community.approvalQueue?.find((q: any) => q.user && q.user._ref === sanityUserId);
  if (pending) return NextResponse.json({ status: "pending" });

  return NextResponse.json({ status: "none" });
} 