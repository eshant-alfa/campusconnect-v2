import { ImageData } from "@/action/createCommunity";
import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { adminClient } from "../adminClient";
import { Subreddit } from "@/sanity.types";

export async function createSubreddit(
  name: string,
  moderatorId: string,
  imageData: ImageData | null,
  customSlug?: string,
  customDescription?: string
) {
  console.log(`Creating subreddit: ${name} with moderator: ${moderatorId}`);

  try {
    // Check if subreddit with this name already exists
    const checkExistingQuery = defineQuery(`
        *[_type == "subreddit" && title == $name][0] {
          _id
        }
      `);

    const existingSubreddit = await sanityFetch({
      query: checkExistingQuery,
      params: { name },
    });

    if (existingSubreddit.data) {
      console.log(`Subreddit "${name}" already exists`);
      return { error: "A subreddit with this name already exists" };
    }

    // Check if slug already exists if custom slug is provided
    if (customSlug) {
      const checkSlugQuery = defineQuery(`
          *[_type == "subreddit" && slug.current == $slug][0] {
            _id
          }
        `);

      const existingSlug = await sanityFetch({
        query: checkSlugQuery,
        params: { slug: customSlug },
      });

      if (existingSlug.data) {
        console.log(`Subreddit with slug "${customSlug}" already exists`);
        return { error: "A subreddit with this URL already exists" };
      }
    }

    // Create slug from name or use custom slug
    const slug = customSlug || name.toLowerCase().replace(/\s+/g, "-");

    // Upload image if provided
    let imageAsset;
    if (imageData) {
      try {
        const imageBuffer = Buffer.from(
          imageData.base64.split(",")[1],
          "base64"
        );

        imageAsset = await adminClient.assets.upload("image", imageBuffer, {
          filename: imageData.filename,
          contentType: imageData.contentType,
        });

        console.log("Image uploaded successfully:", imageAsset._id);
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        return { error: "Failed to upload image" };
      }
    }

    // Create the subreddit document
    const subredditDoc = {
      _type: "subreddit",
      title: name,
      description: customDescription || "",
      slug: {
        _type: "slug",
        current: slug,
      },
      moderator: {
        _type: "reference",
        _ref: moderatorId,
      },
      members: [
        {
          _type: "reference",
          _ref: moderatorId,
        },
      ],
      memberCount: 1,
      createdAt: new Date().toISOString(),
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
          alt: `${name} community icon`,
        },
      }),
    };

    const createdSubreddit = await adminClient.create(subredditDoc);

    console.log("Subreddit created successfully:", createdSubreddit._id);

    return {
      subreddit: {
        _id: createdSubreddit._id,
        title: name,
        slug: { current: slug },
        description: customDescription || "",
        image: imageAsset
          ? {
              asset: { _ref: imageAsset._id },
              alt: `${name} community icon`,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error creating subreddit:", error);
    return { error: "Failed to create subreddit" };
  }
}
