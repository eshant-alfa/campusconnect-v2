import {defineType, defineField} from 'sanity';

export const notificationType = defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{type: 'user'}],
      description: 'The user who should receive this notification',
      validation: (Rule) => Rule.required().error('User is required'),
    }),
    defineField({name: 'type', title: 'Type', type: 'string', description: 'Type of notification (message, community_created, etc.)'}),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'string',
      description: 'Notification text to display',
      validation: (Rule) => Rule.required().error('Content is required'),
    }),
    defineField({name: 'relatedId', title: 'Related ID', type: 'string', description: 'ID of related entity (message, community, etc.)'}),
    defineField({name: 'isRead', title: 'Is Read', type: 'boolean', initialValue: false}),
    defineField({name: 'createdAt', title: 'Created At', type: 'datetime'}),
  ],
}); 