import { NextRequest, NextResponse } from "next/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function POST(req: NextRequest) {
  const { slug, userId } = await req.json();
  if (!slug || !userId) {
    return NextResponse.json({ isMember: false }, { status: 400 });
  }
  const community = await getSubredditBySlug(slug);
  const isMember =
    community && Array.isArray(community.members)
      ? community.members.some((member: any) => member._id === userId)
      : false;
  return NextResponse.json({ isMember });
} 