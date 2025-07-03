"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function fixMemberCount() {
  try {
    console.log("Starting to fix memberCount for existing communities...");
    
    // Get all communities that don't have memberCount or have memberCount as null/undefined
    const communitiesQuery = defineQuery(`
      *[_type == "subreddit" && (!defined(memberCount) || memberCount == null)] {
        _id,
        title,
        members
      }
    `);

    const communities = await adminClient.fetch(communitiesQuery);

    console.log(`Found ${communities.length} communities without memberCount`);

    if (communities.length === 0) {
      return { success: true, message: "All communities already have memberCount" };
    }

    // Fix each community
    const results = [];
    for (const community of communities) {
      try {
        const memberCount = community.members?.length || 0;
        
        const updatedCommunity = await adminClient
          .patch(community._id)
          .set({ memberCount })
          .commit();

        results.push({
          _id: community._id,
          title: community.title,
          memberCount,
          success: true
        });

        console.log(`Fixed community "${community.title}" with memberCount: ${memberCount}`);
      } catch (error) {
        console.error(`Failed to fix community "${community.title}":`, error);
        results.push({
          _id: community._id,
          title: community.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Fixed ${successCount} communities, ${failureCount} failed`,
      results
    };
  } catch (error) {
    console.error("Error in fixMemberCount:", error);
    return { 
      error: `Failed to fix memberCount: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
} 