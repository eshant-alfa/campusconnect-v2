import {defineType, defineField, defineArrayMember} from 'sanity';
import {UsersIcon} from '@sanity/icons';

export const chatGroupType = defineType({
  name: 'chatGroup',
  title: 'Chat Group',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: Rule => Rule.required().error('Group name is required'),
    }),
    defineField({
      name: 'members',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'user'}]})],
      validation: Rule => Rule.required().min(2).error('At least two members are required'),
    }),
    defineField({
      name: 'isGroup',
      type: 'boolean',
      initialValue: true,
      description: 'Is this a group chat?',
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      validation: Rule => Rule.required().error('Creation date is required'),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'createdAt',
    },
  },
}); 