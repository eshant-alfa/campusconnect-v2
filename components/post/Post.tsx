"use client";
import {
  GetAllPostsQueryResult,
  GetPostsForSubredditQueryResult,
  GetPostCommentsQueryResult,
  GetCommentRepliesQueryResult,
  GetPostVotesQueryResult,
  GetUserPostVoteStatusQueryResult,
} from "@/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { MessageSquare } from "lucide-react";
import CommentInput from "../comment/CommentInput";
import CommentList from "../comment/CommentList";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";
import TimeAgo from "../TimeAgo";

interface PostProps {
  post:
    | GetAllPostsQueryResult[number]
    | GetPostsForSubredditQueryResult[number];
  userId: string | null;
  comments: GetPostCommentsQueryResult | GetCommentRepliesQueryResult;
  votes: GetPostVotesQueryResult;
  vote: GetUserPostVoteStatusQueryResult;
}

function Post({ post, userId, comments, votes, vote }: PostProps) {
  return (
    <article
      key={post._id}
      className="relative bg-white rounded-md shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex">
        {/* Vote Buttons */}
        <PostVoteButtons
          contentId={post._id}
          votes={votes}
          vote={vote}
          contentType="post"
        />

        {/* Post Content */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {post.subreddit && (
              <>
                <a
                  href={`/community/${post.subreddit.slug}`}
                  className="font-medium hover:underline"
                >
                  c/{post.subreddit.title}
                </a>
                <span>•</span>
                <span>Posted by</span>
                {post.author && (
                  <a
                    href={`/u/${post.author.username}`}
                    className="hover:underline"
                  >
                    u/{post.author.username}
                  </a>
                )}
                <span>•</span>
                {post.publishedAt && (
                  <TimeAgo date={new Date(post.publishedAt)} />
                )}
              </>
            )}
          </div>

          {/* Category tags */}
          {Array.isArray((post as any).categories) && (post as any).categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {(post as any).categories.map((cat: any) => (
                <span
                  key={cat._id}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {cat.title}
                </span>
              ))}
            </div>
          )}

          {post.subreddit && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {post.title}
              </h2>
            </div>
          )}

          {post.body && post.body[0]?.children?.[0]?.text && (
            <div className="prose prose-sm max-w-none text-gray-700 mb-3">
              {post.body[0].children[0].text}
            </div>
          )}

          {post.image && post.image.asset?._ref && (
            <div className="relative w-full h-64 mb-3 px-2 bg-gray-100/30 ">
              <Image
                src={urlFor(post.image).url()}
                alt={post.image.alt || "Post image"}
                fill
                className="object-contain rounded-md p-2"
              />
            </div>
          )}

          <button className="flex items-center px-1 py-2 gap-1 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length} Comments</span>
          </button>

          <CommentInput postId={post._id} />
          <CommentList postId={post._id} comments={comments} userId={userId} />
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-2">
          <ReportButton contentId={post._id} />

          {post.author?._id && (
            <DeleteButton
              contentOwnerId={post.author?._id}
              contentId={post._id}
              contentType="post"
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default Post;
