import {defineType, defineField, defineArrayMember} from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: rule => rule.required().max(120).error('Title is required and should be short'),
      description: 'Name of the event',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      validation: rule => rule.required().min(10).warning('Description should be at least 10 characters'),
      description: 'Full event description',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Academic', value: 'academic'},
          {title: 'Social', value: 'social'},
          {title: 'Sports', value: 'sports'},
          {title: 'Career', value: 'career'},
          {title: 'Cultural', value: 'cultural'},
          {title: 'Technology', value: 'technology'},
          {title: 'Arts', value: 'arts'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      validation: rule => rule.required().error('Category is required'),
      description: 'Type of event',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          {title: 'In-person', value: 'in-person'},
          {title: 'Virtual', value: 'virtual'},
          {title: 'Hybrid', value: 'hybrid'},
        ],
        layout: 'radio',
      },
      validation: rule => rule.required().error('Event type is required'),
      description: 'Is this event in-person, virtual, or hybrid?',
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      validation: rule => rule.required().error('Start date is required'),
      description: 'When the event starts',
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      validation: rule => rule.required().error('End date is required'),
      description: 'When the event ends',
    }),
    defineField({
      name: 'location',
      type: 'object',
      fields: [
        defineField({ name: 'address', type: 'string', description: 'Street address' }),
        defineField({ name: 'room', type: 'string', description: 'Room or suite' }),
        defineField({ name: 'building', type: 'string', description: 'Building name' }),
        defineField({ name: 'virtualLink', type: 'url', description: 'Virtual event link (if any)' }),
      ],
      description: 'Location details (if in-person or hybrid)',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: rule => rule.required().error('Event image is required'),
      description: 'Event banner or photo',
    }),
    defineField({
      name: 'capacity',
      type: 'number',
      description: 'Maximum number of attendees (optional)',
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: rule => rule.required().error('Status is required'),
      description: 'Current status of the event',
    }),
    defineField({
      name: 'organizer',
      type: 'reference',
      to: [{type: 'user'}],
      validation: rule => rule.required().error('Organizer is required'),
      description: 'User who created the event',
    }),
    defineField({
      name: 'community',
      type: 'reference',
      to: [{type: 'subreddit'}],
      description: 'Community this event belongs to (optional)',
    }),
    defineField({
      name: 'attendees',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'user'}]})],
      description: 'Users attending the event',
    }),
    defineField({
      name: 'requiresApproval',
      type: 'boolean',
      initialValue: false,
      description: 'If true, RSVP requires approval',
    }),
    defineField({
      name: 'isPublic',
      type: 'boolean',
      initialValue: true,
      description: 'If false, event is private',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Tags for search and filtering',
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
      description: 'When this event was created',
    }),
    defineField({
      name: 'updatedAt',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
      description: 'When this event was last updated',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
      start: 'startDate',
      status: 'status',
    },
    prepare({title, subtitle, media, start, status}) {
      return {
        title: `${title} (${status || 'Draft'})`,
        subtitle: `${subtitle || ''}${start ? ' | ' + new Date(start).toLocaleString() : ''}`,
        media,
      }
    },
  },
}) 