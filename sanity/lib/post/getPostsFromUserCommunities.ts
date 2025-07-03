import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getPostsFromUserCommunities(userId: string | null) {
  if (!userId) return [];

  try {
    const getUserCommunityPostsQuery = defineQuery(`
      *[_type == "post" && isDeleted != true && subreddit->members[_ref == $userId]] {
        _id,
        title,
        "slug": slug.current,
        body,
        publishedAt,
        "author": author->,
        "subreddit": subreddit->,
        image,
        isDeleted
      } | order(publishedAt desc)
    `);

    const posts = await sanityFetch({ 
      query: getUserCommunityPostsQuery,
      params: { userId }
    });
    
    return posts.data || [];
  } catch (error) {
    console.error("Error getting posts from user communities:", error);
    return [];
  }
} 