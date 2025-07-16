"use server";

import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { runAllModerationChecks } from "@/lib/openaiModeration";

export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find user in Sanity
    const user = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username}`,
      { clerkId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    const contentToModerate = content.trim();

    // AI MODERATION
    const moderationResult = await runAllModerationChecks(contentToModerate, "comment");
    if (moderationResult.flagged) {
      await adminClient.create({
        _type: "flaggedContent",
        content: contentToModerate,
        user: { _type: "reference", _ref: user._id },
        type: "comment",
        reason: moderationResult.reason + ` (via ${moderationResult.method})`,
        createdAt: new Date().toISOString(),
      });
      throw new Error(`Comment blocked: ${moderationResult.reason}`);
    }

    // Log if AI moderation is unavailable
    if (!moderationResult.aiAvailable) {
      console.warn(`Comment created with basic moderation only (AI unavailable) - User: ${user.username || user.name}, Content: ${contentToModerate.substring(0, 100)}...`);
    }

    const comment = await adminClient.create({
      _type: "comment",
      post: { _type: "reference", _ref: postId },
      author: { _type: "reference", _ref: user._id },
      content: contentToModerate,
      createdAt: new Date().toISOString(),
      ...(parentCommentId && { parentComment: { _type: "reference", _ref: parentCommentId } }),
    });

    return { success: true, comment };
  } catch (error) {
    console.error("Create comment error:", error);
    throw error;
  }
}
