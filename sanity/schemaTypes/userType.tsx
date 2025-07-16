import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";
import Image from "next/image";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,

  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      description: "The unique username for this user",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      description: "The unique Clerk user ID for this user",
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
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "User's profile picture",
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
      name: "isReported",
      title: "Is Reported",
      type: "boolean",
      description: "Whether this user has been reported",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "username",
      media: "image",
    },
    prepare({ title, media }) {
      return {
        title,
        media: media || <UserIcon />,
      };
    },
  },
});
