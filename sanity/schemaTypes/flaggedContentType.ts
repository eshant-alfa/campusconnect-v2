import { defineType, defineField } from 'sanity';
import { AlertTriangleIcon } from 'lucide-react';

export const flaggedContentType = defineType({
  name: 'flaggedContent',
  title: 'Flagged Content',
  type: 'document',
  icon: AlertTriangleIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'string',
      description: 'The text that was flagged as inappropriate',
      validation: (Rule) => Rule.required().error('Content is required'),
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'The user who submitted the content',
      validation: (Rule) => Rule.required().error('User is required'),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { 
        list: [
          'post', 
          'comment', 
          'eventComment', 
          'marketplaceItem', 
          'message', 
          'survey', 
          'event'
        ], 
        layout: 'radio' 
      },
      validation: (Rule) => Rule.required().error('Type is required'),
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'string',
      description: 'Reason flagged by AI moderation',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'type',
      subtitle: 'reason',
      media: 'icon',
    },
  },
}); 