"use server";

import { getUser } from "@/sanity/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function joinCommunity(communityId: string) {
  try {
    console.log("Starting joinCommunity with communityId:", communityId);
    
    const user = await getUser();

    if ("error" in user) {
      console.error("Error getting user:", user.error);
      return { error: user.error };
    }

    console.log("User found:", user._id);

    // Check if user is already a member
    const checkMembershipQuery = defineQuery(`
      *[_type == "subreddit" && _id == $communityId] {
        _id,
        members,
        memberCount
      }[0]
    `);

    const community = await adminClient.fetch(checkMembershipQuery, {
      communityId,
    });

    if (!community) {
      console.error("Community not found:", communityId);
      return { error: "Community not found" };
    }

    console.log("Community found:", community);

    // Check if user is already a member by checking if their ID is in the members array
    const isAlreadyMember = community.members?.some(
      (member: { _ref: string }) => member._ref === user._id
    );

    if (isAlreadyMember) {
      console.log("User is already a member");
      return { error: "You are already a member of this community" };
    }

    console.log("User is not a member, adding to community");

    // Add user to members array and increment member count
    const updatedCommunity = await adminClient
      .patch(communityId)
      .setIfMissing({ members: [], memberCount: 0 })
      .append("members", [{ _ref: user._id, _type: "reference" }])
      .inc({ memberCount: 1 })
      .commit();

    console.log("Successfully joined community:", updatedCommunity);

    return { success: true, community: updatedCommunity };
  } catch (error) {
    console.error("Error in joinCommunity:", error);
    return { error: `Failed to join community: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 