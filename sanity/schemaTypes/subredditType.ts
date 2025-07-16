import { defineField, defineType } from "sanity";
import { TagIcon } from "lucide-react";

export const subredditType = defineType({
  name: "subreddit",
  title: "Subreddit",
  type: "document",
  icon: TagIcon,
  description: "A community where users can post and engage with content",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Name of the subreddit",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "A brief description of what this subreddit is about",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The unique URL-friendly identifier for this subreddit",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Icon or banner image for the subreddit",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
          description: "Alternative text for screen readers and SEO",
        },
      ],
    }),
    defineField({
      name: "moderator",
      title: "Moderator",
      type: "reference",
      description:
        "The user who created this subreddit and has admin privileges",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "When this subreddit was created",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "members",
      title: "Members",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "user", type: "reference", to: [{ type: "user" }] },
            { name: "role", type: "string", options: { list: ["owner", "moderator", "member"] } },
            { name: "status", type: "string", options: { list: ["active", "pending", "banned"] } },
            { name: "joinedAt", type: "datetime" },
          ],
        },
      ],
      description: "List of members with roles and statuses",
    }),
    defineField({
      name: "rules",
      title: "Rules",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", description: "Rule title" },
            { name: "description", type: "text", description: "Rule description" },
          ],
        },
      ],
      description: "Community rules",
      validation: (rule) => rule.required().min(1).error("At least one rule is required for every community."),
    }),
    defineField({
      name: "modLogs",
      title: "Moderation Logs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "modAction" }] }],
      description: "Moderation actions taken in this community",
    }),
    defineField({
      name: "appeals",
      title: "Appeals",
      type: "array",
      of: [{ type: "reference", to: [{ type: "appeal" }] }],
      description: "Appeals submitted by users in this community",
    }),
    defineField({
      name: "welcomeMessage",
      title: "Welcome Message",
      type: "string",
      description: "Message sent to new members when they join the community",
    }),
    defineField({
      name: "approvalQueue",
      title: "Approval Queue",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "user", type: "reference", to: [{ type: "user" }] },
            { name: "requestedAt", type: "datetime" },
          ],
        },
      ],
      description: "Users waiting for approval to join",
    }),
    defineField({
      name: "bannedUsers",
      title: "Banned Users",
      type: "array",
      of: [{ type: "reference", to: [{ type: "user" }] }],
      description: "List of banned users",
    }),
    defineField({
      name: "type",
      title: "Community Type",
      type: "string",
      options: { list: ["public", "restricted", "private"] },
      initialValue: "public",
      description: "Type of community: public, restricted, or private",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
