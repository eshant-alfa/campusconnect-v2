import {defineType, defineField, defineArrayMember} from 'sanity';

export const conversationType = defineType({
  name: 'conversation',
  title: 'Conversation',
  type: 'document',
  fields: [
    defineField({
      name: 'participants',
      title: 'Participants',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'user'}]})],
      validation: rule => rule.required().min(2).max(2),
    }),
    defineField({name: 'lastMessage', title: 'Last Message', type: 'string'}),
    defineField({name: 'updatedAt', title: 'Updated At', type: 'datetime'}),
  ],
}); 