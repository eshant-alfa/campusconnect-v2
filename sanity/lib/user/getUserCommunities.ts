import { adminClient } from "../adminClient";

export async function getUserCommunities(clerkId: string) {
  try {
    // First get the user's Sanity ID
    const user = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId }
    );

    if (!user?._id) {
      return [];
    }

    // Get all communities where the user is an active member
    const communities = await adminClient.fetch(`
      *[_type == "subreddit" && 
        count(members[user._ref == $userId && status == "active"]) > 0]{
        _id,
        title,
        slug,
        type,
        description,
        image,
        "memberCount": count(members[status == "active"]),
        "userRole": members[user._ref == $userId][0].role
      } | order(title asc)
    `, { userId: user._id });

    return communities || [];
  } catch (error) {
    console.error("Error getting user communities:", error);
    return [];
  }
} 