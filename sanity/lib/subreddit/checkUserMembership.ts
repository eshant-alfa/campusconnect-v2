import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function checkUserMembership(
  communityId: string,
  userId: string | null
) {
  if (!userId) return false;

  try {
    const membershipQuery = defineQuery(`
      *[_type == "subreddit" && _id == $communityId && $userId in members[]._ref][0] {
        _id
      }
    `);

    const result = await sanityFetch({
      query: membershipQuery,
      params: { communityId, userId },
    });

    return !!result.data;
  } catch (error) {
    console.error("Error checking user membership:", error);
    return false;
  }
} 