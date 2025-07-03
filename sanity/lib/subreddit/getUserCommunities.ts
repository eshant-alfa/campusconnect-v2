import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getUserCommunities(userId: string | null) {
  if (!userId) return [];

  try {
    const userCommunitiesQuery = defineQuery(`
      *[_type == "subreddit" && $userId in members[]._ref] {
        _id,
        title,
        slug,
        description,
        image,
        memberCount,
        createdAt
      } | order(createdAt desc)
    `);

    const result = await sanityFetch({
      query: userCommunitiesQuery,
      params: { userId },
    });

    return result.data || [];
  } catch (error) {
    console.error("Error getting user communities:", error);
    return [];
  }
} 