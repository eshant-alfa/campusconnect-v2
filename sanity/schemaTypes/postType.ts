import { defineField, defineType, defineArrayMember } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: () => "📝",
  description: "A user-submitted post in a community",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The title of the post",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "originalTitle",
      title: "Original Title",
      type: "string",
      description: "Stores the original title if the post is deleted",
      hidden: true,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      description: "The user who created this post",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "community",
      title: "Community",
      type: "reference",
      description: "The community this post belongs to",
      to: [{ type: "subreddit" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description: "The main content of the post",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Optional image for the post",
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
      name: "status",
      title: "Status",
      type: "string",
      description: "The current status of this post",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Reported", value: "reported" },
          { title: "Deleted", value: "deleted" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "When this post was published",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }],
        }),
      ],
      description: 'Select one or more categories for this post',
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "author.username",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle,
        media,
      };
    },
  },
});
