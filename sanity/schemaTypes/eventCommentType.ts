import { defineType, defineField } from 'sanity';
import { CommentIcon } from '@sanity/icons';

export const eventCommentType = defineType({
  name: 'eventComment',
  title: 'Event Comment',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: rule => rule.required().min(1).max(1000).error('Comment must be between 1 and 1000 characters'),
      description: 'The text content of the comment',
    }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
      validation: rule => rule.required().error('Event is required'),
      description: 'The event this comment belongs to',
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: rule => rule.required().error('User is required'),
      description: 'The user who wrote this comment',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
      description: 'When this comment was posted',
    }),
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'eventComment' }],
      description: 'If this is a reply to another comment',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      user: 'user.username',
      event: 'event.title',
    },
    prepare(selection) {
      const { content, user, event } = selection;
      return {
        title: `${user || 'Unknown'} on ${event || 'Event'}`,
        subtitle: content?.substring(0, 50) + (content?.length > 50 ? '...' : ''),
        media: CommentIcon,
      };
    },
  },
}); 