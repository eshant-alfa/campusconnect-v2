import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getSubreddits() {
  const getSubredditsQuery = defineQuery(`*[_type == "subreddit"] {
        ...,
        "slug": slug.current,
        "moderator": moderator->,
        "members": members[]{user, status},
      } | order(createdAt desc)`);

  const subreddits = await sanityFetch({ query: getSubredditsQuery });

  return subreddits.data;
}
