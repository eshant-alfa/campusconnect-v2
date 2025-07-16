import { NextRequest, NextResponse } from "next/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function GET(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;
  const community = await getSubredditBySlug(slug);
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });
  return NextResponse.json(community);
} 