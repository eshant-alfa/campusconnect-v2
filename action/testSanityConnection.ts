"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function testSanityConnection() {
  try {
    console.log("Testing Sanity admin client connection...");
    
    // Try to fetch a simple query
    const testQuery = defineQuery(`
      *[_type == "subreddit"][0...1] {
        _id,
        title
      }
    `);

    const result = await adminClient.fetch(testQuery);
    console.log("Test query result:", result);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Sanity connection test failed:", error);
    return { error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 