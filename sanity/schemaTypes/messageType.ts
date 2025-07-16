import {defineType, defineField} from 'sanity';

export const messageType = defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  fields: [
    defineField({name: 'conversation', title: 'Conversation', type: 'reference', to: [{type: 'conversation'}]}),
    defineField({name: 'sender', title: 'Sender', type: 'reference', to: [{type: 'user'}]}),
    defineField({name: 'content', title: 'Content', type: 'string'}),
    defineField({name: 'sentAt', title: 'Sent At', type: 'datetime'}),
    defineField({name: 'isRead', title: 'Is Read', type: 'boolean', initialValue: false}),
  ],
}); 