import { adminClient } from "../adminClient";
import { runAllModerationChecks } from "@/lib/openaiModeration";

interface AddCommentParams {
  content: string;
  postId: string;
  userId: string; // This should be the Sanity user document ID
  parentCommentId?: string;
}

export async function addComment({
  content,
  postId,
  parentCommentId,
  userId,
}: AddCommentParams) {
  try {
    const contentToModerate = content.trim();

    // AI MODERATION
    const moderationResult = await runAllModerationChecks(contentToModerate, "comment");
    if (moderationResult.flagged) {
      await adminClient.create({
        _type: "flaggedContent",
        content: contentToModerate,
        user: { _type: "reference", _ref: userId },
        type: "comment",
        reason: moderationResult.reason + ` (via ${moderationResult.method})`,
        createdAt: new Date().toISOString(),
      });
      throw new Error(`Comment blocked: ${moderationResult.reason}`);
    }

    // Log if AI moderation is unavailable
    if (!moderationResult.aiAvailable) {
      console.warn(`Comment created with basic moderation only (AI unavailable) - Content: ${contentToModerate.substring(0, 100)}...`);
    }

    // Create comment document
    const commentData = {
      _type: "comment",
      content: contentToModerate,
      author: {
        _type: "reference",
        _ref: userId,
      },
      post: {
        _type: "reference",
        _ref: postId,
      },
      parentComment: parentCommentId
        ? {
            _type: "reference",
            _ref: parentCommentId,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Create the comment in Sanity
    const comment = await adminClient.create(commentData);

    return { comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "Failed to add comment" };
  }
}
