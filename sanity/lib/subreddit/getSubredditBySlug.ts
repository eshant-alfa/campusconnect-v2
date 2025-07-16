import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getSubredditBySlug(slug: string) {
  const lowerCaseSlug = slug.toLowerCase();
  const getSubredditBySlugQuery =
    defineQuery(`*[_type == "subreddit" && (slug.current == $slug || title == $title)][0] {
      ...,
      "slug": slug.current,
      "moderator": moderator->{_id, username},
      "type": type,
      "members": members[]{user, role, status, joinedAt},
      "approvalQueue": approvalQueue[]{user, requestedAt},
      "modLogs": modLogs[]->,
      "appeals": appeals[]->,
      "welcomeMessage": welcomeMessage,
    }`);

  const subreddit = await sanityFetch({
    query: getSubredditBySlugQuery,
    params: { slug: lowerCaseSlug, title: slug },
  });

  return subreddit.data;
}
