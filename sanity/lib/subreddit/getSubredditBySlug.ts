import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSubredditBySlug(slug: string) {
  try {
    const subredditQuery = defineQuery(`
      *[_type == "subreddit" && slug.current == $slug][0] {
        _id,
        title,
        description,
        slug,
        image,
        memberCount,
        members[]->{_id},
        moderator->{
          _id,
          username,
          email
        },
        createdAt
      }
    `);

    const result = await sanityFetch({
      query: subredditQuery,
      params: { slug },
    });

    return result.data;
  } catch (error) {
    console.error("Error getting subreddit by slug:", error);
    return null;
  }
}
