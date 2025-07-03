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
  const userA = searchParams.get("userA");
  const userB = searchParams.get("userB");
  const userId = searchParams.get("userId");

  if (userA && userB) {
    // GROQ: fetch messages where (sender is userA and recipient is userB) or (sender is userB and recipient is userA)
    const query = `
      *[_type == "message" &&
        ((sender._ref == $userA && recipients[0]._ref == $userB) ||
         (sender._ref == $userB && recipients[0]._ref == $userA))
      ] | order(timestamp asc)
    `;
    try {
      const messages = await sanity.fetch(query, { userA, userB });
      return NextResponse.json({ messages });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
  } else if (userId) {
    // Fetch all messages where the user is either the sender or a recipient
    const query = `
      *[_type == "message" && (sender._ref == $userId || recipients[]._ref == $userId)] | order(timestamp desc)
    `;
    try {
      const messages = await sanity.fetch(query, { userId });
      return NextResponse.json({ messages });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
  }
} 