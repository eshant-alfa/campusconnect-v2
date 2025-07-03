import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
  apiVersion: "2023-07-01",
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q) {
    return NextResponse.json({ users: [] });
  }

  // GROQ: search users by username (case-insensitive, partial match)
  const query = `
    *[_type == "user" && username match $pattern][0...10]{_id, username}
  `;
  const pattern = `*${q}*`;

  try {
    const users = await sanity.fetch(query, { pattern });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
} 