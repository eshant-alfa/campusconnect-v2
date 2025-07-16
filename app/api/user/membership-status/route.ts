import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isMember: false });
    }
    // Get Sanity user ID
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    const sanityUserId = sanityUser?._id || null;
    if (!sanityUserId) {
      return NextResponse.json({ isMember: false });
    }
    // Fetch all communities and check if user is a member
    const allCommunities = await getSubreddits();
    const isMember = allCommunities.some((community: any) =>
      (community.members || []).some(
        (m: any) => m.user && m.user._ref === sanityUserId && m.status === "active"
      )
    );
    return NextResponse.json({ isMember });
  } catch {
    return NextResponse.json({ isMember: false });
  }
} 