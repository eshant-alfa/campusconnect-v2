import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
  apiVersion: "2023-07-01",
});

export async function GET() {
  const query = `*[_type == "category"]{_id, title}`;
  const categories = await sanity.fetch(query);
  return NextResponse.json({ categories });
} 