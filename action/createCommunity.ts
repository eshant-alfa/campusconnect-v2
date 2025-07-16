"use server";

import { createSubreddit } from "@/sanity/lib/subreddit/createSubreddit";
import { getUser } from "@/sanity/lib/user/getUser";

export type ImageData = {
  base64: string;
  filename: string;
  contentType: string;
} | null;

export async function createCommunity(
  name: string,
  imageBase64: string | null | undefined,
  imageFilename: string | null | undefined,
  imageContentType: string | null | undefined,
  slug?: string,
  description?: string,
  communityType?: string
) {
  try {
    const user = await getUser();

    if ("error" in user) {
      return { error: user.error };
    }

    // Prepare image data if provided
    let imageData: ImageData = null;
    if (imageBase64 && imageFilename && imageContentType) {
      imageData = {
        base64: imageBase64,
        filename: imageFilename,
        contentType: imageContentType,
      };
    }

    const result = await createSubreddit(
      name,
      user._id,
      imageData,
      slug,
      description,
      communityType
    );

    // Notify the creator
    if (result && result.subreddit && result.subreddit._id && user._id) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userClerkId: user._id,
          type: 'community_created',
          content: 'You created a community',
          relatedId: result.subreddit._id,
        }),
      });
    }

    return result;
  } catch (error) {
    console.error("Error in createCommunity:", error);
    return { error: "Failed to create community" };
  }
}
