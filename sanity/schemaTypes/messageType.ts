import {defineType, defineField, defineArrayMember} from 'sanity';
import {CommentIcon} from '@sanity/icons';

export const messageType = defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'sender',
      type: 'reference',
      to: [{type: 'user'}],
      validation: Rule => Rule.required().error('Sender is required'),
    }),
    defineField({
      name: 'recipients',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'user'}]})],
      validation: Rule => Rule.required().min(1).error('At least one recipient is required'),
    }),
    defineField({
      name: 'content',
      type: 'string',
      validation: Rule => Rule.required().error('Message content is required'),
    }),
    defineField({
      name: 'timestamp',
      type: 'datetime',
      validation: Rule => Rule.required().error('Timestamp is required'),
    }),
    defineField({
      name: 'readBy',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'user'}]})],
      description: 'Users who have read this message',
    }),
    defineField({
      name: 'group',
      type: 'reference',
      to: [{type: 'chatGroup'}],
      description: 'Group chat this message belongs to (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'content',
      subtitle: 'timestamp',
    },
  },
}); 