import { defineField, defineType } from "sanity";

export const commentType = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  icon: () => "💬",
  description: "A comment on a post or another comment",
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      description: "The text content of the comment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      description: "The user who wrote this comment",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "post",
      title: "Post",
      type: "reference",
      description:
        "The post this comment belongs to (even for nested comments)",
      to: [{ type: "post" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parentComment",
      title: "Parent Comment",
      type: "reference",
      description: "If this is a reply, reference to the parent comment",
      to: [{ type: "comment" }],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "The current status of this comment",
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
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "When this comment was posted",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "content",
      subtitle: "author.username",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
      };
    },
  },
});
