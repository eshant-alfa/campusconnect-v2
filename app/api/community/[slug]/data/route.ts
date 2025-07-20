import { NextRequest, NextResponse } from "next/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const community = await getSubredditBySlug(slug);
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });
  return NextResponse.json(community);
} 