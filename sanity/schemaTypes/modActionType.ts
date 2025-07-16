import { defineField, defineType } from "sanity";
import { WarningOutlineIcon } from "@sanity/icons";

export const modActionType = defineType({
  name: "modAction",
  title: "Moderation Action",
  type: "document",
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: "actionType",
      title: "Action Type",
      type: "string",
      options: {
        list: [
          { title: "Ban User", value: "ban" },
          { title: "Unban User", value: "unban" },
          { title: "Approve Post", value: "approve_post" },
          { title: "Remove Post", value: "remove_post" },
          { title: "Assign Moderator", value: "assign_mod" },
          { title: "Remove Moderator", value: "remove_mod" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "targetUser",
      title: "Target User",
      type: "reference",
      to: [{ type: "user" }],
      description: "User affected by this action (if any)",
    }),
    defineField({
      name: "targetPost",
      title: "Target Post",
      type: "reference",
      to: [{ type: "post" }],
      description: "Post affected by this action (if any)",
    }),
    defineField({
      name: "reason",
      title: "Reason",
      type: "text",
      description: "Reason for the moderation action",
    }),
    defineField({
      name: "mod",
      title: "Moderator",
      type: "reference",
      to: [{ type: "user" }],
      description: "Moderator who performed the action",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "actionType",
      subtitle: "reason",
      media: "mod",
    },
  },
}); 