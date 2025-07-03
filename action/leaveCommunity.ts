"use server";

import { getUser } from "@/sanity/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function leaveCommunity(communityId: string) {
  try {
    const user = await getUser();

    if ("error" in user) {
      return { error: user.error };
    }

    console.log("Leaving community:", communityId, "for user:", user._id);

    // Check if user is a member
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
      return { error: "Community not found" };
    }

    console.log("Community found:", community);

    // Check if user is a member by checking if their ID is in the members array
    const isMember = community.members?.some(
      (member: { _ref: string }) => member._ref === user._id
    );

    if (!isMember) {
      return { error: "You are not a member of this community" };
    }

    console.log("User is a member, removing from community");

    // Remove user from members array and decrement member count
    const updatedCommunity = await adminClient
      .patch(communityId)
      .setIfMissing({ memberCount: 0 })
      .unset([`members[_ref == "${user._id}"]`])
      .dec({ memberCount: 1 })
      .commit();

    console.log("Successfully left community:", updatedCommunity);

    return { success: true, community: updatedCommunity };
  } catch (error) {
    console.error("Error in leaveCommunity:", error);
    return { error: "Failed to leave community" };
  }
} 