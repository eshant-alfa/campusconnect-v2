import { defineField, defineType } from 'sanity';

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Name of the category',
      validation: Rule => Rule.required().error('Category title is required'),
    }),
  ],
}); 