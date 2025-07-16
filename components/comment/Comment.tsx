import {
  GetCommentRepliesQueryResult,
  GetPostCommentsQueryResult,
} from "@/sanity.types";
import { getCommentReplies } from "@/sanity/lib/comment/getCommentReplies";
import UsernameDisplay from "./UsernameDisplay";
import Image from "next/image";
import TimeAgo from "../TimeAgo";
import CommentList from "./CommentList";
import CommentReply from "./CommentReply";
import PostVoteButtons from "../post/PostVoteButtons";

async function Comment({
  postId,
  comment,
  userId,
}: {
  postId: string;
  comment:
    | GetPostCommentsQueryResult[number]
    | GetCommentRepliesQueryResult[number];
  userId: string | null;
}) {
  const replies = await getCommentReplies(comment._id, userId);
  const userVoteStatus = comment.votes.voteStatus;

  // Determine Clerk user ID: prefer author.clerkId, fallback to author._id if present
  const clerkId = (comment.author && 'clerkId' in comment.author && comment.author.clerkId)
    ? comment.author.clerkId
    : (comment.author && comment.author._id ? comment.author._id : null);

  return (
    <article className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex gap-4">
        <PostVoteButtons
          contentId={comment._id}
          votes={comment.votes}
          vote={userVoteStatus}
          contentType="comment"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Avatar and Username display */}
            <UsernameDisplay
              clerkId={clerkId}
              fallback={
                comment.author &&
                typeof comment.author === 'object' &&
                'username' in comment.author &&
                typeof comment.author.username === 'string' &&
                comment.author.username &&
                !comment.author.username.startsWith('user_')
                  ? comment.author.username
                  : 'Anonymous'
              }
            />
            <span className="text-xs text-gray-500">
              <TimeAgo date={new Date(comment.createdAt!)} />
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{comment.content}</p>

          <CommentReply postId={postId} comment={comment} />

          {/* Comment replies - supports infinite nesting */}
          {replies?.length > 0 && (
            <div className="mt-3 ps-2 border-s-2 border-gray-100">
              <CommentList postId={postId} comments={replies} userId={userId} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default Comment;
