import { defineField, defineType } from "sanity";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: () => "👤",

  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      description: "The unique username for this user",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "User's email address",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL",
      type: "string",
      description: "User's Clerk profile picture",
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      description: "When this user account was created",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Whether this user has been reported",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Reported", value: "reported" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),
  ],
  preview: {
    select: {
      title: "username",
      subtitle: "email",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
      };
    },
  },
});
