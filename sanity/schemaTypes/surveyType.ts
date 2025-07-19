import { defineType, defineField, defineArrayMember } from 'sanity';
import { ListIcon } from '@sanity/icons';

export const surveyType = defineType({
  name: 'survey',
  title: 'Survey / Poll',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required().min(4).max(100),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      description: 'Optional start date/time',
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      description: 'Optional end date/time',
    }),
    defineField({
      name: 'anonymous',
      type: 'boolean',
      initialValue: false,
      description: 'If true, responses are anonymous',
    }),
    defineField({
      name: 'questions',
      type: 'array',
      of: [defineArrayMember({ type: 'surveyQuestion' })],
      validation: Rule => Rule.required().min(1).custom((questions) => {
        if (!questions || !Array.isArray(questions)) return true;
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i] as { _key?: string };
          if (!question._key) {
            return `Question ${i + 1} is missing a unique key. Please save and re-edit this survey.`;
          }
        }
        return true;
      }),
    }),
    defineField({
      name: 'creator',
      type: 'reference',
      to: [{ type: 'user' }],
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'updatedAt',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `Status: ${subtitle}` : '',
      };
    },
  },
});

export const surveyQuestionType = defineType({
  name: 'surveyQuestion',
  title: 'Survey Question',
  type: 'object',
  fields: [
    defineField({
      name: '_key',
      type: 'string',
      hidden: true,
      readOnly: true,
      description: 'Unique key for this question (auto-generated)',
    }),
    defineField({
      name: 'question',
      type: 'string',
      validation: Rule => Rule.required().min(4),
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Single Choice', value: 'single' },
          { title: 'Multiple Choice', value: 'multiple' },
          { title: 'Short Text', value: 'text' },
          { title: 'Rating (1-5)', value: 'rating' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'options',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      hidden: ({ parent }) => parent?.type !== 'single' && parent?.type !== 'multiple',
      validation: Rule => Rule.custom((val, ctx) => {
        const parent = ctx.parent as { type?: string };
        if ((parent?.type === 'single' || parent?.type === 'multiple') && (!val || val.length < 2)) {
          return 'At least 2 options required for choice questions.';
        }
        return true;
      }),
    }),
    defineField({
      name: 'required',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});

export const surveyResponseEntryType = defineType({
  name: 'surveyResponseEntry',
  title: 'Survey Response Entry',
  type: 'object',
  fields: [
    defineField({ name: 'key', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'value', type: 'string', validation: Rule => Rule.required() }),
  ],
});

export const surveyResponseType = defineType({
  name: 'surveyResponse',
  title: 'Survey Response',
  type: 'document',
  fields: [
    defineField({
      name: 'survey',
      type: 'reference',
      to: [{ type: 'survey' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'user',
      type: 'reference',
      to: [{ type: 'user' }],
      hidden: ({ document }) => document?.anonymous === true,
    }),
    defineField({
      name: 'responses',
      type: 'array',
      of: [defineArrayMember({ type: 'surveyResponseEntry' })],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    }),
  ],
}); 