import { defineField, defineType, defineArrayMember } from "sanity";

export const subredditType = defineType({
  name: "subreddit",
  title: "Community",
  type: "document",
  icon: () => "🏷️",
  description: "A community where users can post and engage with content",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Name of the community",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "A brief description of what this community is about",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The unique URL-friendly identifier for this community",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Icon or banner image for the community",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt Text",
          description: "Alternative text for screen readers and SEO",
        }),
      ],
    }),
    defineField({
      name: "moderator",
      title: "Moderator",
      type: "reference",
      description:
        "The user who created this community and has admin privileges",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "members",
      title: "Members",
      type: "array",
      description: "Users who have joined this community",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "user" }],
        }),
      ],
      initialValue: [],
    }),
    defineField({
      name: "memberCount",
      title: "Member Count",
      type: "number",
      description: "Number of members in this community",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "When this community was created",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      memberCount: "memberCount",
    },
    prepare({ title, media, memberCount }) {
      return {
        title,
        subtitle: `${memberCount || 0} members`,
        media,
      };
    },
  },
});
