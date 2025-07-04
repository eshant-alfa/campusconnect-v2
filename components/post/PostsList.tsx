import { getPosts } from "@/sanity/lib/post/getPosts";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { currentUser } from "@clerk/nextjs/server";
import Post from "./Post";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { GetAllPostsQueryResult } from "@/sanity.types";

async function PostsList() {
  const posts = await getPosts();
  const user = await currentUser();
  const userId = user?.id || null;

  // If user is not signed in, show sign-in message
  if (!userId) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600 mb-6">
            Sign in to see posts from your joined communities and connect with other students.
          </p>
          <Link 
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Fetch comments, votes, and vote for each post in parallel
  const postData = await Promise.all(
    posts.map(async (post: GetAllPostsQueryResult[number]) => {
      const [comments, votes, vote] = await Promise.all([
        getPostComments(post._id, userId),
        getPostVotes(post._id),
        getUserPostVoteStatus(post._id, userId),
      ]);
      return { post, comments, votes, vote };
    })
  );

  return (
    <div className="space-y-4">
      {postData.map(({ post, comments, votes, vote }) => (
        <Post
          key={post._id}
          post={post}
          userId={userId}
          comments={comments}
          votes={votes}
          vote={vote}
        />
      ))}
    </div>
  );
}

export default PostsList;
