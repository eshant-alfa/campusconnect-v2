import Post from "@/components/post/Post";
import { urlFor } from "@/sanity/lib/image";
import { getPostsForSubreddit } from "@/sanity/lib/subreddit/getPostsForSubreddit";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { checkUserMembership } from "@/sanity/lib/subreddit/checkUserMembership";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import CommunityActions from "@/components/community/CommunityActions";
import { Users } from "lucide-react";

async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getSubredditBySlug(slug);
  if (!community) return null;
  const user = await currentUser();
  const userId = user?.id || null;
  const posts = await getPostsForSubreddit(community._id);
  // Fetch comments, votes, and vote for each post in parallel
  const postData = await Promise.all(
    posts.map(async (post) => {
      const [comments, votes, vote] = await Promise.all([
        getPostComments(post._id, userId),
        getPostVotes(post._id),
        getUserPostVoteStatus(post._id, userId),
      ]);
      return { post, comments, votes, vote };
    })
  );
  // Check if user is a member of this community
  const isMember = await checkUserMembership(community._id, userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Community Banner */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex items-center gap-6 flex-1">
          {community?.image && community.image.asset?._ref ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-white">
              <Image
                src={urlFor(community.image).url()}
                alt={community.image.alt || `${community.title} community icon`}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="h-24 w-24 flex items-center justify-center rounded-2xl border-4 border-white shadow-xl bg-white">
              <Users className="w-12 h-12 text-blue-400" />
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 leading-tight drop-shadow-sm">{community?.title}</h1>
            {community?.description && (
              <p className="text-lg text-blue-700 mb-2 max-w-xl">{community.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                <Users className="w-4 h-4" />
                {community.memberCount || 0} members
              </span>
              {community.moderator?._id === user?.id && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Moderator</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <CommunityActions 
            communityId={community._id}
            isMember={isMember}
            isModerator={community.moderator?._id === user?.id}
          />
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="flex flex-col gap-6">
          {postData.length > 0 ? (
            postData.map(({ post, comments, votes, vote }) => (
              <div key={post._id} className="bg-white rounded-2xl shadow-md p-6">
                <Post
                  post={post}
                  userId={userId}
                  comments={comments}
                  votes={votes}
                  vote={vote}
                />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-10 text-center">
              <p className="text-gray-500 text-lg">No posts in this community yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CommunityPage;
