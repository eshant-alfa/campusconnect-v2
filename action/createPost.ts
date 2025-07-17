"use server";

import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { runAllModerationChecks } from "@/lib/openaiModeration";

interface CreatePostParams {
  title: string;
  body?: string;
  subredditSlug: string;
  imageField?: {
    _type: "image";
    asset: {
      _type: "reference";
      _ref: string;
    };
  };
}

export async function createPost(params: CreatePostParams) {
  const { title, body = "", subredditSlug, imageField } = params;
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

    // Find subreddit by slug
    const subreddit = await adminClient.fetch(
      `*[_type == "subreddit" && slug.current == $subredditSlug][0]{_id, name, slug}`,
      { subredditSlug }
    );

    if (!subreddit) {
      throw new Error("Subreddit not found");
    }

    const titleToModerate = title.trim();
    const contentToModerate = body.trim();

    // CUSTOM KEYWORD FILTER (extra sensitivity)
    const blockedWords = ["hate", "idiot", "stupid", "dumb", "kill", "racist", "sexist", "nazi", "terrorist", "violence", "abuse"];
    const combinedText = `${titleToModerate} ${contentToModerate}`.toLowerCase();
    
    if (blockedWords.some(word => combinedText.includes(word))) {
      await adminClient.create({
        _type: "flaggedContent",
        content: `Title: ${titleToModerate}\nContent: ${contentToModerate}`,
        user: { _type: "reference", _ref: user._id },
        type: "post",
        reason: "Blocked by keyword filter",
        createdAt: new Date().toISOString(),
      });
      throw new Error("Your post was blocked for inappropriate language.");
    }

    // AI MODERATION BEFORE POST CREATION
    const moderationResult = await runAllModerationChecks(combinedText, "post");
    if (moderationResult.flagged) {
      await adminClient.create({
        _type: "flaggedContent",
        content: `Title: ${titleToModerate}\nContent: ${contentToModerate}`,
        user: { _type: "reference", _ref: user._id },
        type: "post",
        reason: moderationResult.reason + ` (via ${moderationResult.method})`,
        createdAt: new Date().toISOString(),
      });
      throw new Error(`Your post was blocked for inappropriate content. Reason: ${moderationResult.reason}`);
    }

    // Log if AI moderation is unavailable
    if (!moderationResult.aiAvailable) {
      console.warn(`Post created with basic moderation only (AI unavailable) - User: ${user.username || user.name}, Title: ${titleToModerate.substring(0, 50)}...`);
    }

    // Convert body text to rich text blocks
    const bodyBlocks = contentToModerate ?
      [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: contentToModerate,
            },
          ],
        },
      ] : [];

    const post = await adminClient.create({
      _type: "post",
      title: titleToModerate,
      body: bodyBlocks, // Use body field with rich text blocks
      author: { _type: "reference", _ref: user._id },
      subreddit: { _type: "reference", _ref: subreddit._id },
      publishedAt: new Date().toISOString(),
      ...(imageField && { image: imageField }), // Use the Sanity image object directly
    });

    return { success: true, post };
  } catch (error) {
    console.error("Create post error:", error);
    throw error;
  }
}
