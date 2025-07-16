import { defineField, defineType } from "sanity";
import { HelpCircleIcon } from "@sanity/icons";

export const appealType = defineType({
  name: "appeal",
  title: "Appeal",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      description: "User submitting the appeal",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "targetType",
      title: "Target Type",
      type: "string",
      options: {
        list: [
          { title: "Ban", value: "ban" },
          { title: "Post Removal", value: "post_removal" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "targetId",
      title: "Target ID",
      type: "string",
      description: "ID of the ban, post, or other entity being appealed",
    }),
    defineField({
      name: "reason",
      title: "Reason",
      type: "text",
      description: "Reason for the appeal",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reviewedBy",
      title: "Reviewed By",
      type: "reference",
      to: [{ type: "user" }],
      description: "Moderator who reviewed the appeal",
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed At",
      type: "datetime",
      description: "When the appeal was reviewed",
    }),
  ],
  preview: {
    select: {
      title: "user.username",
      subtitle: "reason",
      media: "status",
    },
  },
}); 