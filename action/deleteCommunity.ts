"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function deleteCommunity(subredditId: string) {
  try {
    const user = await getUser();
    if ("error" in user) {
      return { error: user.error };
    }

    // Fetch the community and check ownership
    const community = await adminClient.fetch(
      `*[_type == "subreddit" && _id == $id][0]{ _id, members, title, slug }`,
      { id: subredditId }
    );
    if (!community) return { error: "Community not found" };
    const owner = community.members?.find((m: any) => m.role === "owner");
    if (!owner || owner.user._ref !== user._id) {
      return { error: "Only the owner can delete this community." };
    }

    // Delete all posts in the community
    const posts = await adminClient.fetch(
      `*[_type == "post" && subreddit._ref == $id]{ _id }`,
      { id: subredditId }
    );
    for (const post of posts) {
      // Delete all comments for each post
      const comments = await adminClient.fetch(
        `*[_type == "comment" && post._ref == $postId]{ _id }`,
        { postId: post._id }
      );
      for (const comment of comments) {
        await adminClient.delete(comment._id);
      }
      await adminClient.delete(post._id);
    }

    // Delete the community itself
    await adminClient.delete(subredditId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting community:", error);
    return { error: "Failed to delete community" };
  }
} 